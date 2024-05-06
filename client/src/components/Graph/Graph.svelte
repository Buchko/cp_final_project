<script lang="ts">
    import {onMount, setContext} from 'svelte'
    import {
        winrateThreshold,
        targetedNodesList,
        showLosingMatchups,
        storeNodes,
        storeEdges,
        storeWinningNodes,
        storetargetedNodes,
        considerTargets,
        rightBarMouseIn,
        rightBarMouseOut
    } from "../../utils/store"
    import cytoscape from 'cytoscape'
    import dagre from 'cytoscape-dagre'
    import cola from 'cytoscape-cola'
    import {style} from '../GraphStyles'
    import Floater from "../abstract/Floater.svelte";
    import {remToPx} from "../../utils/math"
    import ChampionIcons from "../ChampionIcons.svelte"
    import {zoom} from "../../utils/store"
    import fcose from 'cytoscape-fcose';
    import FloatingChampionIcons from "./FloatingChampionIcons/FloatingChampionIcons.svelte"

    export let nodes
    export let edges

    let refElement: HTMLElement | null = null
    let cyInstance: cytoscape.Core | null = null

    let targetedNodes: cytoscape.Collection | null = null;
    let removedEdges: cytoscape.Collection | null = null;
    let removedNodes: cytoscape.Collection | null = null;
    let selectedNode: cytoscape.NodeSingular | null = null;

    let nodePositions
    let nodeTopPositions

    const getNodePositions = (nodes) => {
        const data = nodes.map(node => [node, {
            position: node.renderedPosition(),
            width: node.renderedWidth(),
            height: node.renderedHeight()
        }])
        return data
    }

    const addOffsets = ({nodePositions}) => {
        const ans = nodePositions.map(entry => {
            const [node, position] = entry
            return [node, {
                x: position.position.x,
                y: position.position.y - position.height / 2,
            }]
        })
        return ans
    }

    const resetNodes = () => {
        removedNodes.restore()
        removedNodes = cyInstance?.collection()
    }


    $: {
        if ($targetedNodesList && cyInstance) {
            //setting everything to unselected
            resetNodes()
            let localtargetedNodes = cyInstance?.collection()
            const nodes = cyInstance.nodes()
            nodes.data("selected", false)

            //selecting the stuff that got selected
            for (const id of $targetedNodesList) {
                const ele = cyInstance.getElementById(id)
                localtargetedNodes = localtargetedNodes?.union(ele)
                ele.data("selected", true)
            }

            targetedNodes = localtargetedNodes
        }
    }

    $: {
        if (targetedNodes || $winrateThreshold || $showLosingMatchups) {
            updateGraph(removedEdges, $winrateThreshold, targetedNodes, $showLosingMatchups, $considerTargets, selectedNode)
        }
    }
    const calcEdgeLength = edge => 20
    let layoutFormat = {
        name: 'cola',
        // padding: remToPx(8),
        // flow: {axis: "x", minSeparation: 0},
        // edgeLength: calcEdgeLength
        // infinite: true
    }
    // let layoutFormat = {
    //     name: 'fcose',
    //     padding: remToPx(8),
    //     animationDuration: 250,
    //     randomize: true,
    // }
    const updateGraph = (removedEdges, winrateThreshold, targetedNodes, showLosingMatchups: boolean, considerTargets: boolean, selectedNode) => {
        if (!cyInstance) {
            return
        }
        //restoring nodes
        removedNodes.restore()
        removedNodes = cyInstance.collection()


        removedEdges.restore();
        removedEdges = cyInstance.collection()


        //remove edges based on their threshold
        let newRemovedEdges = ((winrateThreshold) => {
            return cyInstance.remove(`edge[win_rate<${winrateThreshold}]`)
        })($winrateThreshold)

        //remove edges based on selected nodes
        if (selectedNode) {
            const selectedEdges = selectedNode.connectedEdges()
            const selectedEdgesToRemove = cyInstance.edges().difference(selectedEdges)
            cyInstance.remove(selectedEdgesToRemove)
            newRemovedEdges = newRemovedEdges.union(selectedEdgesToRemove)
        }

        //remove edges based on targeted nodes
        const nodeRemovedEdges = ((targetedNodes) => {
            if (targetedNodes.empty()) {
                return cyInstance.remove(cyInstance.edges())
            }
            let edgesToKeep
            if (showLosingMatchups) {
                const winningDecks = targetedNodes.nodes().incomers().sources()
                const losingMatchUps = targetedNodes.edgesTo(winningDecks)
                losingMatchUps.data("losing", true)

                const winningMatchUps = winningDecks.edgesTo(targetedNodes)
                winningMatchUps.data("losing", false)
                edgesToKeep = losingMatchUps.union(winningMatchUps)
            } else {
                edgesToKeep = targetedNodes.nodes().incomers().edges()
                edgesToKeep.data("losing", false)
            }

            if (!considerTargets) {
                const internalEdges = targetedNodes.edgesTo(targetedNodes)
                edgesToKeep = edgesToKeep.difference(internalEdges)
            }
            const edgesToRemove = cyInstance.edges().subtract(edgesToKeep)
            return cyInstance.remove(edgesToRemove)
        })(targetedNodes)

        newRemovedEdges = newRemovedEdges.union(nodeRemovedEdges)
        removedEdges = newRemovedEdges

        removedNodes = cyInstance.remove(cyInstance.nodes("[[degree = 0]]"))

        //sometimes when adding nodes, they are set to hovered, so always removing that
        // cyInstance.edges().removeClass("hovered")
        cyInstance.makeLayout(layoutFormat).run()

        //updating store
        storeNodes.set(cyInstance.nodes())
        storeEdges.set(cyInstance.edges())
        storetargetedNodes.set(targetedNodes)
        storeWinningNodes.set(targetedNodes.incomers().sources())
    }

    const handleMouseIn = (node) => {
        const edges = node.connectedEdges()
        edges.addClass("hovered")
        node.addClass("hovered")
    }

    const handleMouseOut = (node) => {
        const edges = node.connectedEdges()
        edges.removeClass("hovered")
        node.removeClass("hovered")
    }


    onMount(() => {
        cytoscape.use(dagre)
        cytoscape.use(cola)
        cytoscape.use(fcose)

        cyInstance = cytoscape({
            container: refElement,
            style
        })
        cyInstance.add(nodes)
        cyInstance.add(edges)

        removedEdges = cyInstance.remove(cyInstance.edges())
        removedNodes = cyInstance.remove(cyInstance.nodes())

        // const layoutFormat = {name: "dagre", rankDir: "TB", nodeSep: 25}
        cyInstance
            .makeLayout(layoutFormat)
            .run()

        targetedNodes = cyInstance.collection()
        updateGraph(removedEdges, winrateThreshold, targetedNodes, true)

        cyInstance.on("tap", "node", (event) => {
            //toggling whether clicked node is selected
            if (!cyInstance || !targetedNodes || !removedEdges) return
            const newClickedNode = event.target
            if (newClickedNode == selectedNode) {
                selectedNode = null
            } else {
                selectedNode = newClickedNode
            }
            updateGraph(removedEdges, $winrateThreshold, targetedNodes, $showLosingMatchups, $considerTargets, selectedNode)
            // if (targetedNodes?.contains(clickedNode)) {
            //     //unselecting that node and restoring removed edges
            //     targetedNodes = targetedNodes?.subtract(clickedNode)
            //     targetedNodesList.update(nodes => nodes.filter(node => node != id))
            //     clickedNode.data("selected", false)
            // } else {
            //     //adding this node to the list of selected nodes
            //     targetedNodes = targetedNodes.union(clickedNode)
            //     targetedNodesList.update(nodes => [])
            //     clickedNode.data("selected", true)
            // }
        })

        cyInstance.on("mouseover", "node", (event) => {
            const node = event.target
            handleMouseIn(node)
        })

        cyInstance.on("mouseout", "node", (event) => {
            const node = event.target
            handleMouseOut(node)
        })
        cyInstance.on("render", () => {
            nodePositions = getNodePositions(cyInstance?.nodes())
            zoom.set(cyInstance.zoom())
        })
    })

    let shouldDisplay
    $: shouldDisplay = nodePositions && nodePositions.length > 0

    rightBarMouseIn.subscribe(node => {
        if (!cyInstance) return
        console.log({node})
        const ele = cyInstance.getElementById(node.id)
        handleMouseIn(ele)
    })

    rightBarMouseOut.subscribe(node => {
        if (!cyInstance) return
        const ele = cyInstance.getElementById(node.id)
        handleMouseOut(ele)
    })
</script>

<div class="graph" bind:this={refElement} id="cy">
    {#if shouldDisplay}
        {#each [...nodePositions] as [node, value]}
            <Floater x={value.position.x} y={value.position.y}>
                <FloatingChampionIcons {node}/>
            </Floater>
        {/each}
    {/if}
</div>

{#if !shouldDisplay}
    <div id="feedback-text" class="text-5xl text-error">
        {#if targetedNodes && targetedNodes.length === 0}
            Select Decks to Counter
        {:else}
            No Decks Found
        {/if}
    </div>
{/if}

<style lang="postcss">
    #cy {
        width: 100%;
        height: 100vh;
        display: block;
        text-align: center;
    }

    #feedback-text {
        position: absolute;
        display: flex;
        /*top: 0;*/
        left: 30rem;
        height: 100vh;
        width: calc(100% - 30rem - 40rem);
        text-align: center;
        margin: auto;
        justify-content: center;
        align-items: center;
    }

</style>