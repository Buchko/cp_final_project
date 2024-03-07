<script lang="ts">
    import "./app.css"
    import Graph from './components/Graph.svelte'
    import Sidebar from './components/Sidebar/Sidebar.svelte'
    import {initialEdges, initialNodes} from "./stubbed/data.js"
    import {addFirstChampionImage} from "./utils/lor";

    const mode = "standard"

    const parseGraphData = (type: string, data: any) => {
        //filtering edges that have the same source and target
        const filterer = type === "edges" ? (edge) => edge.source !== edge.target : _ => true
        //@ts-ignore node any type is okay
        return data.filter(filterer).map(node => ({group: type, id: node.id, data: {...node}}))
    }

    const filterEdges = (edges, threshold: number) => {
        //filters out edges with a winrate below given amount
        return edges.filter(edge => edge.data.win_rate >= threshold)
    }

    let nodes = initialNodes
    let edges = initialEdges

    let parsedNodes = parseGraphData("nodes", nodes)
    parsedNodes = addFirstChampionImage(parsedNodes);
    let parsedEdges = parseGraphData("edges", edges)
    parsedEdges = filterEdges(parsedEdges, 0.50)

    //adding labels to edges from their winrate
    const labledEdges = parsedEdges.map(edge => ({ ...edge, label: edge.data.win_rate }));
</script>

    <div id="document">
        <Sidebar archetypes={nodes}/>
        <Graph nodes={ parsedNodes } edges={labledEdges}>
        </Graph>
    </div>

<style lang="postcss">
    div{
        background-color: theme(colors.gray.100);
        color: theme(colors.gray.100);
    }

    #document{
        display: flex;
        flex-direction: row;
        background-color: theme(colors.base-100);
    }
</style>