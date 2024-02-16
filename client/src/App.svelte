<script lang="ts">
    import Graph from './components/Graph.svelte'
    import GraphNode from './components/GraphNode.svelte'
    import GraphEdge from './components/GraphEdge.svelte'


    import {initialEdges, initialNodes} from "./stubbed/data"

    const parseGraphData = (type: string, data: any) => {
        //filtering edges that have the same source and target
        const filterer = type === "edges" ? (edge) => edge.source !== edge.target : _ => true
        //@ts-ignore node any type is okay
        return data.filter(filterer).map(node => ({group: type, id: node.id, data: {...node}}))
    }

    const addChampionImages = (nodes: any) => {

        const getImageUrl = (championCode: string) => {
            return new URL(`./assets/champion_portraits/${championCode}.webp`, import.meta.url).href
        }
        const getChampionCode = (node) => {
            return node.data.assets.champions[0][1]
        }

        for (const node of nodes) {
            node.data.imageUrl = getImageUrl(getChampionCode(node))
        }
        return nodes
    }

    const filterEdges = (edges, threshold: number) => {
        //filters out edges with a winrate below given amount
        return edges.filter(edge => edge.data.win_rate >= threshold)
    }

    let nodes = initialNodes
    let edges = initialEdges

    let parsedNodes = parseGraphData("nodes", nodes)
    parsedNodes = addChampionImages(parsedNodes);
    let parsedEdges = parseGraphData("edges", edges)
    //adding labels to edges from their winrate
    edges = parsedEdges.map(edge => ({ ...edge, label: edge.data.win_rate }));
    parsedEdges = filterEdges(parsedEdges, 0.55)

</script>
<Graph nodes={ parsedNodes } edges={parsedEdges}>
</Graph>

<style>
</style>