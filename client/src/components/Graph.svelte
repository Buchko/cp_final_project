<script lang="ts">
    import {onMount, setContext} from 'svelte'
    import {winrateThreshold, selectedNodesList, showLosingMatchups} from "../utils/store"
    import  cytoscape from 'cytoscape'
    import dagre from 'cytoscape-dagre'
    import cola from 'cytoscape-cola'
    import {style} from './GraphStyles'

    export let nodes
    export let edges

    setContext('graphSharedState', {
        getCyInstance: () => cyInstance
    })

    let refElement: HTMLElement | null = null
    let cyInstance: cytoscape.Core | null = null

    let selectedNodes: cytoscape.Collection | null = null;
    let removedEdges: cytoscape.Collection | null = null;


    $: {
        if ($selectedNodesList && cyInstance ){
            //setting everything to unselected
            let localSelectedNodes = cyInstance?.collection()
            const nodes = cyInstance.nodes()
            nodes.data("selected", false)

            //selecting the stuff that got selected
            for (const id of $selectedNodesList){
                const ele = cyInstance.getElementById(id)
                localSelectedNodes = localSelectedNodes?.union(ele)
                ele.data("selected", true)
            }

            selectedNodes = localSelectedNodes
        }
    }

    $: {
        if (selectedNodes || $winrateThreshold || $showLosingMatchups){
            updateGraph(removedEdges, $winrateThreshold, selectedNodes, $showLosingMatchups)
        }
    }
    const layoutFormat = {name: 'cola', flow: {axis: "x", minSeperator: 10}}
    const updateGraph = (removedEdges, winrateThreshold, selectedNodes, showLosingMatchups) => {
        if (!cyInstance){
            return
        }
        console.log("polar", {selectedNodes})
        removedEdges.restore();
        removedEdges = cyInstance.collection()
        //remove edges based on their threshold
        let newRemovedEdges = ((winrateThreshold) => {
            return cyInstance.remove(`edge[win_rate<${winrateThreshold}]`)
        })($winrateThreshold)

        //remove edges based on selected nodes
        const nodeRemovedEdges = ((selectedNodes) => {
            if (selectedNodes.empty()){
                return cyInstance.remove(cyInstance.edges())
            }
            let edgesToKeep
            if (showLosingMatchups){
                const winningDecks = selectedNodes.nodes().incomers().sources()
                //get edges that go from target nodes to selected nodes
                edgesToKeep = selectedNodes.edgesWith(winningDecks)
                console.log("edges to keep", {winningDecks, edgesToKeep})
            } else {
                edgesToKeep = selectedNodes.nodes().incomers().edges()
            }
            const edgesToRemove = cyInstance.edges().subtract(edgesToKeep)
            return cyInstance.remove(edgesToRemove)
        })(selectedNodes)
        newRemovedEdges = newRemovedEdges.union(nodeRemovedEdges)
        removedEdges = newRemovedEdges
        cyInstance.makeLayout(layoutFormat).run()
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

        // const layoutFormat = {name: "dagre", rankDir: "TB", nodeSep: 25}
        cyInstance
            .makeLayout(layoutFormat)
            .run()

        selectedNodes = cyInstance.collection()
        updateGraph(removedEdges, winrateThreshold, selectedNodes)

        cyInstance.on("tap", "node", (event) => {
            if (!cyInstance || !selectedNodes || !removedEdges){
                return
            }
            //remove edges not connected to this node and rerun the layout
            const clickedNode = event.target
            const id = clickedNode.id();
            if (selectedNodes?.contains(clickedNode)){
                //unselecting that node and restoring removed edges
                selectedNodes = selectedNodes?.subtract(clickedNode)
                selectedNodesList.update(nodes => nodes.filter(node => node != id))
                clickedNode.data("selected", false)
            } else  {
                //adding this node to the list of selected nodes
                selectedNodes = selectedNodes.union(clickedNode)
                selectedNodesList.update(nodes => [...nodes, id])
                clickedNode.data("selected", true)
            }
        })
    })

</script>

<div class="graph" bind:this={refElement} id="cy">
</div>

<style lang="postcss">
    #cy {
        width: 2000px;
        height: 2000px;
        display: block;
    }
</style>