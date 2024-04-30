<script lang="ts">
    import "./app.css";
    import Graph from "./components/Graph.svelte";
    import Sidebar from "./components/Sidebar/Sidebar.svelte";
    import { addFirstChampionImage } from "./utils/lor";
    import { totalGamesPlayed } from "./utils/store";
    import RightBar from "./components/RightBar/RightBar.svelte";
    import { fetchMetaData } from "./services/services";
    import { onMount } from "svelte";

    const mode = "standard";

    const parseGraphData = (type: string, data: any) => {
        //filtering edges that have the same source and target
        const filterer =
            type === "edges"
                ? (edge) => edge.source !== edge.target
                : (_) => true;
        //@ts-ignore node any type is okay
        return data
            .filter(filterer)
            .map((node) => ({ group: type, id: node.id, data: { ...node } }));
    };

    const filterEdges = (edges, threshold: number) => {
        //filters out edges with a winrate below given amount
        return edges.filter((edge) => edge.data.win_rate >= threshold);
    };

    const getTotalGamesPlayed = (edges) => {
        return edges.reduce((sum, edge) => {
            const isSelfEdge =
                edge.games_played === 1000 && edge.win_rate === 0.5;
            if (isSelfEdge) {
                return sum;
            }
            return sum + edge.games_played;
        }, 0);
    };

    // let nodes = initialNodes;
    // let edges = initialEdges;

    let nodes;
    let filteredEdges;
    let parsedEdges;
    let parsedNodes;
    let readyToRender = false;

    // testFetch();
    onMount(async () => {
        const res = await fetchMetaData("standard");
        nodes = res.nodes;
        const edges = res.edges;

        parsedNodes = parseGraphData("nodes", nodes);
        parsedNodes = addFirstChampionImage(parsedNodes);


        parsedEdges  = parseGraphData("edges", edges);
        filteredEdges = filterEdges(parsedEdges, 0.5);
        totalGamesPlayed.set(getTotalGamesPlayed(edges));

        readyToRender = true;
    });
</script>

<div id="document">
    {#if readyToRender}
        <Sidebar archetypes={nodes} />
        <Graph nodes={parsedNodes} edges={filteredEdges} />
        <RightBar nodes={parsedNodes} edges={parsedEdges} />
    {/if}
</div>

<style lang="postcss">
    div {
        background-color: theme(colors.gray.100);
        color: theme(colors.gray.100);
    }

    #document {
        display: flex;
        flex-direction: row;
        background-color: theme(colors.base-100);
    }
</style>
