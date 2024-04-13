<script lang="ts">
    import {storeSelectedNodes, storeWinningNodes, totalGamesPlayed} from "../utils/store.js"
    import {weightedAverage} from "../utils/math.js"
    import {displayPercentage} from "../utils/utils"

    export let nodes: any[]
    export let edges: any[]
    let performances: [object, number][]

    const calculateTable = (nodes, edges, selectedNodes, winningNodes, gamesPlayed) => {
        if (!nodes || !edges || !selectedNodes ||!winningNodes || !gamesPlayed) return
        // console.log("polar", {nodes, edges})
        const selectedNodesIds = new Set(selectedNodes.map(node => node.id()))
        console.log("polar winning nodes", winningNodes.map(node => node.data()))
        const getAverageMUWinrate =
            (winningNode) => {
                // const matchUps = winningNode.edgesTo(selectedNodes)
                const matchUps = edges.filter(edge => edge.data.source == winningNode.id() && selectedNodesIds.has(edge.data.target))
                console.log("polar", {winningNode, matchUps})
                const weights = matchUps.map(edge => edge.data.games_played / $totalGamesPlayed)
                const winRates = matchUps.map(edge => edge.data.win_rate)
                return weightedAverage(weights, winRates)
            }
        const averagePerformances = winningNodes.map(node => [node.data(), getAverageMUWinrate(node)])
        const sortedPerformances = averagePerformances.sort((a, b) => b[1] - a[1])
        return new Map(sortedPerformances)
    }
    //subscriber functions
    storeSelectedNodes.subscribe(_ => performances = calculateTable(nodes, edges, $storeSelectedNodes, $storeWinningNodes, $totalGamesPlayed))
    storeWinningNodes.subscribe(_ => performances = calculateTable(nodes, edges, $storeSelectedNodes, $storeWinningNodes, $totalGamesPlayed))

</script>
    <div id="wrapper">
        <h2 class="text-2xl">
            Recommended Decks
        </h2>
        {#if performances && performances.size > 0}
        <table class="table table-md">
            <thead>
            <tr>
                <th>Deck</th>
                <th>Targeted Winrate</th>
                <th>Global Winrate</th>
            </tr>
            </thead>
            <tbody>
            {#each [...performances] as [deck, performance]}
                <tr>
                    <td>{deck.label}</td>
                    <td>{displayPercentage(performance)}</td>
                    <td>{displayPercentage(deck.win_rate)}</td>
                </tr>
            {/each}
            </tbody>
        </table>
        {:else}
            <div id="alt-text-wrapper">
                <span>
                Select decks to counter to see recommended decks
                </span>
            </div>
        {/if}

    </div>
<style>
    #wrapper {
        width: 40rem;
        padding: 1rem
    }

    #alt-text-wrapper{
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>