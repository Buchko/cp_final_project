<script lang="ts">
    import {onMount, setContext} from 'svelte'
    import cytoscape from 'cytoscape'
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

        const layoutFormat = {name: 'cola', flow: {axis: "x", minSeperator: 10}}
        // const layoutFormat = {name: "dagre", rankDir: "TB", nodeSep: 25}
        cyInstance
            .makeLayout(layoutFormat)
            .run()

        selectedNodes = cyInstance.collection()

        cyInstance.on("tap", "node", (event) => {
            if (!cyInstance || !selectedNodes || !removedEdges){
                return
            }
            //remove edges not connected to this node and re run the layout
            const clickedNode = event.target
            const id = clickedNode.id();
            console.log("polar", id)
            if (selectedNodes?.contains(clickedNode)){
                console.log("restoring", removedEdges)
                //unselecting that node and restoring removed edges
                selectedNodes = selectedNodes?.subtract(clickedNode)
                //updating it's attribute
                const targetNode = cyInstance.getElementById(id)
                targetNode.json({selected: false})
            } else  {
                //adding this node to the list of selected nodes
                selectedNodes = selectedNodes.union(clickedNode)
                const targetNode = cyInstance.getElementById(id)
                console.log("polar target node", {targetNode})
                targetNode.json({selected: true})
            }

            //removing edges based on selected nodes
            removedEdges = ((selectedNodes) => {
                removedEdges.restore()
                console.log("polar in fun", {selectedNodes})
                if (selectedNodes.empty()) {
                    //removing all the edges when no nodes are selected
                    return cyInstance.remove(cyInstance.edges())
                }
                // const edgesToKeep = (selectedNodes.nodes().outgoers().union(selectedNodes.nodes().incomers())).edges()
                const edgesToKeep = selectedNodes.nodes().incomers().edges()
                console.log("polar edges to keep", edgesToKeep)
                const edgesToRemove = cyInstance.edges().subtract(edgesToKeep)
                return cyInstance.remove(edgesToRemove)
            })(selectedNodes)
            cyInstance?.makeLayout(layoutFormat).run()
        })

        $: {
            if (selectedNodes) {
                if (selectedNodes.empty() === 0){
                    //add all the edges back to the graph
                } else {
                    //removing all edges not connected to the selected nodes

                }

            }
        }
    })

</script>

<div class="graph" bind:this={refElement} id="cy">
</div>

<style>
    #cy {
        width: 2000px;
        height: 2000px;
        display: block;
    }
</style>