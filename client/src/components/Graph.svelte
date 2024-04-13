<script lang="ts">
    import {onMount, setContext} from 'svelte'
    import {
        winrateThreshold,
        selectedNodesList,
        showLosingMatchups,
        storeNodes,
        storeEdges,
        storeWinningNodes,
        storeSelectedNodes
    } from "../utils/store"
    import cytoscape from 'cytoscape'
    import dagre from 'cytoscape-dagre'
    import cola from 'cytoscape-cola'
    import {style} from './GraphStyles'
    import Floater from "./Floater.svelte";
    import {remToPx} from "../utils/math"
    import ChampionIcons from "./ChampionIcons.svelte"
    import {zoom} from "../utils/store"

    export let nodes
    export let edges

    let refElement: HTMLElement | null = null
    let cyInstance: cytoscape.Core | null = null

    let selectedNodes: cytoscape.Collection | null = null;
    let removedEdges: cytoscape.Collection | null = null;
    let removedNodes: cytoscape.Collection | null = null;

    let nodePositions
    let nodeTopPositions

    const getNodePositions = (nodes) => {
        const data = nodes.map(node => [node.id(), {
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
        if ($selectedNodesList && cyInstance) {
            //setting everything to unselected
            resetNodes()
            let localSelectedNodes = cyInstance?.collection()
            const nodes = cyInstance.nodes()
            nodes.data("selected", false)

            //selecting the stuff that got selected
            for (const id of $selectedNodesList) {
                const ele = cyInstance.getElementById(id)
                localSelectedNodes = localSelectedNodes?.union(ele)
                ele.data("selected", true)
            }

            selectedNodes = localSelectedNodes
        }
    }

    $: {
        if (selectedNodes || $winrateThreshold || $showLosingMatchups) {
            updateGraph(removedEdges, $winrateThreshold, selectedNodes, $showLosingMatchups)
        }
    }
    const layoutFormat = {
        name: 'cola',
        flow: {axis: "x", minSeperator: 2},
        padding: remToPx(8),
    }
    const updateGraph = (removedEdges, winrateThreshold, selectedNodes, showLosingMatchups) => {
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
        const nodeRemovedEdges = ((selectedNodes) => {
            if (selectedNodes.empty()) {
                return cyInstance.remove(cyInstance.edges())
            }
            let edgesToKeep
            if (showLosingMatchups) {
                const winningDecks = selectedNodes.nodes().incomers().sources()
                //get edges between winning decks and target decks
                //get edges that go from target decks to winning deck, aka losing match ups
                const losingMatchUps = selectedNodes.edgesTo(winningDecks)
                losingMatchUps.data("losing", true)
                const winningMatchUps = winningDecks.edgesTo(selectedNodes)
                winningMatchUps.data("losing", false)
                edgesToKeep = losingMatchUps.union(winningMatchUps)
            } else {
                edgesToKeep = selectedNodes.nodes().incomers().edges()
                edgesToKeep.data("losing", false)
            }
            const edgesToRemove = cyInstance.edges().subtract(edgesToKeep)
            return cyInstance.remove(edgesToRemove)
        })(selectedNodes)
        newRemovedEdges = newRemovedEdges.union(nodeRemovedEdges)
        removedEdges = newRemovedEdges

        removedNodes = cyInstance.remove(cyInstance.nodes("[[degree = 0]]"))


        cyInstance.makeLayout(layoutFormat).run()
        nodePositions = getNodePositions(cyInstance.nodes(":inside"))

        //updating store
        storeNodes.set(cyInstance.nodes())
        storeEdges.set(cyInstance.edges())
        storeSelectedNodes.set(selectedNodes)
        storeWinningNodes.set(selectedNodes.incomers().sources())
    }

    onMount(() => {
        cytoscape.use(dagre)
        cytoscape.use(cola)

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

        selectedNodes = cyInstance.collection()
        updateGraph(removedEdges, winrateThreshold, selectedNodes, true)

        cyInstance.on("tap", "node", (event) => {
            //toggling whether clicked node is selected
            if (!cyInstance || !selectedNodes || !removedEdges) return

            const clickedNode = event.target
            const id = clickedNode.id();
            if (selectedNodes?.contains(clickedNode)) {
                //unselecting that node and restoring removed edges
                selectedNodes = selectedNodes?.subtract(clickedNode)
                selectedNodesList.update(nodes => nodes.filter(node => node != id))
                clickedNode.data("selected", false)
            } else {
                //adding this node to the list of selected nodes
                selectedNodes = selectedNodes.union(clickedNode)
                selectedNodesList.update(nodes => [...nodes, id])
                clickedNode.data("selected", true)
            }
        })

        cyInstance.on("mouseover", "node", (event) => {
            const node = event.target
            const edges = node.connectedEdges()
            edges.addClass("hovered")
        })

        cyInstance.on("mouseout", "node", (event) => {
            const node = event.target
            const edges = node.connectedEdges()
            edges.removeClass("hovered")
        })

        cyInstance.on("render", () => {
            nodePositions = getNodePositions(cyInstance?.nodes())
            nodeTopPositions = addOffsets({nodePositions})
            zoom.set(cyInstance.zoom())
        })
    })

</script>

<div class="graph" bind:this={refElement} id="cy">
    {#if nodeTopPositions && nodeTopPositions.length > 0}
        {#each [...nodeTopPositions] as [nodeId, value]}
            <Floater x={value.x} y={value.y}>
                <ChampionIcons node={cyInstance.$id(nodeId)}></ChampionIcons>
            </Floater>
        {/each}
    {/if}
</div>

<style lang="postcss">
    #cy {
        width: 100%;
        height: 100vh;
        display: block;
        text-align: center;
    }

    #graph-text {
        display: flex;
        align-content: center;
        justify-content: center;
    }

</style>