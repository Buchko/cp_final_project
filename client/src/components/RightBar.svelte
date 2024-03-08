<script lang="ts">
    import {storeNodes, storeEdges, storeSelectedNodes, storeWinningNodes, totalGamesPlayed} from "../utils/store.js"
    import {weightedAverage} from "../utils/math.js"
    import {displayPercentage} from "../utils/utils"

    let performances: [object, number][]

    const calculateTable = (nodes, edges, selectedNodes, winningNodes, gamesPlayed) => {
        if (!nodes || !edges || !selectedNodes ||!winningNodes || !gamesPlayed) return
        const getAverageMUWinrate =
            (winningNode) => {
                const matchUps = winningNode.edgesTo(selectedNodes)
                const weights = matchUps.map(edge => edge.data().games_played / $totalGamesPlayed)
                const winRates = matchUps.map(edge => edge.data().win_rate)
                return weightedAverage(weights, winRates)
            }
        const averagePerformances = winningNodes.map(node => [node.data(), getAverageMUWinrate(node)])
        const sortedPerformances = averagePerformances.sort((a, b) => b[1] - a[1])
        console.log("polar", {sortedPerformances})
        return new Map(sortedPerformances)
    }
    //subscriber functions
    storeNodes.subscribe(_ => performances = calculateTable($storeNodes, $storeEdges, $storeSelectedNodes, $storeWinningNodes, $totalGamesPlayed))
    storeEdges.subscribe(_ => performances = calculateTable($storeNodes, $storeEdges, $storeSelectedNodes, $storeWinningNodes, $totalGamesPlayed))
    storeSelectedNodes.subscribe(_ => performances = calculateTable($storeNodes, $storeEdges, $storeSelectedNodes, $storeWinningNodes, $totalGamesPlayed))
    storeWinningNodes.subscribe(_ => performances = calculateTable($storeNodes, $storeEdges, $storeSelectedNodes, $storeWinningNodes, $totalGamesPlayed))

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
                <th>Predicted Winrate</th>
            </tr>
            </thead>
            <tbody>
            {#each [...performances] as [deck, performance]}
                <tr>
                    <td>{deck.label}</td>
                    <td>{displayPercentage(performance)}</td>
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