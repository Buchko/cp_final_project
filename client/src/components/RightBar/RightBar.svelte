<script lang="ts">
    import {storetargetedNodes, storeWinningNodes} from "../../utils/store.js"
    import {weightedAverage} from "../../utils/math.js"
    import {displayPercentage} from "../../utils/utils"
    import Stat from "../Daisy/Stats.svelte"

    export let nodes: any[]
    export let edges: any[]
    let performances: [object, number][]

    const calculateTable = (nodes, edges, targetedNodes, winningNodes) => {
        if (!nodes || !edges || !targetedNodes || !winningNodes) return
        console.log({nodes, edges})
        const targetedNodesIds = new Set(targetedNodes.map(node => node.id()))
        const getAverageMUWinrate =
            (winningNode) => {
                // const matchUps = winningNode.edgesTo(targetedNodes)
                const matchUps = edges.filter(edge => edge.data.source == winningNode.id() && targetedNodesIds.has(edge.data.target))
                const weights = matchUps.map(edge => {
                    const target = edge.data.target
                    const targetNode = nodes.filter(node => node.data.id === target)[0]
                    return targetNode.data.play_rate
                })
                const winRates = matchUps.map(edge => edge.data.win_rate)
                return weightedAverage(weights, winRates)
            }
        const averagePerformances = winningNodes.map(node => [node.data(), getAverageMUWinrate(node)])
        const sortedPerformances = averagePerformances.sort((a, b) => b[1] - a[1])
        return new Map(sortedPerformances)
    }

    const deckNameToUrl = (deckName: string, mode: "standard" | "eternal") => {
        const deckNameForUrl = deckName.replace(/[ (]/g, "-").replace(/[^0-9a-z\-]/gi, '').toLowerCase()
        return `https://masteringruneterra.com/archetype/${deckNameForUrl}/${mode}/three/everyone/`
    }

    //subscriber functions
    storetargetedNodes.subscribe(_ => performances = calculateTable(nodes, edges, $storetargetedNodes, $storeWinningNodes))
    storeWinningNodes.subscribe(_ => performances = calculateTable(nodes, edges, $storetargetedNodes, $storeWinningNodes))
</script>
<div id="wrapper">
    <h2 class="text-2xl">
        Recommended Decks
    </h2>
    {#if performances && performances.size > 0}
        {#each [...performances] as [deck, performance]}
            <div class="collapse bg-base-200">
                <input type="radio" name="my-accordion-1">
                <div class="collapse-title text-xl font-medium">
                    <span>{deck.label}</span>
                    <span>{displayPercentage(performance)}</span>
                </div>
                <div class="collapse-content">
                    <Stat stats={
                    [
                        {title: "Play Rate", value: displayPercentage(deck.play_rate)},
                        {title: "Global Win Rate", value: displayPercentage(deck.win_rate)},
                    ]
                    }/>
                    <div>
                        <a class="link link-primary" href={deckNameToUrl(deck.label, "standard")}>View deck list at Mastering Runeterra</a>
                    </div>
                </div>
            </div>
        {/each}
    {:else}
        <div id="alt-text-wrapper">
                <span>
                Select decks to counter to see recommended decks
                </span>
        </div>
    {/if}

    <!--    <div id="wrapper">-->
    <!--        <h2 class="text-2xl">-->
    <!--            Recommended Decks-->
    <!--        </h2>-->
    <!--        {#if performances && performances.size > 0}-->
    <!--        <table class="table table-md">-->
    <!--            <thead>-->
    <!--            <tr>-->
    <!--                <th>Deck</th>-->
    <!--                <th>Winrate Against Targets</th>-->
    <!--                <th>Global Winrate</th>-->
    <!--            </tr>-->
    <!--            </thead>-->
    <!--            <tbody>-->
    <!--            {#each [...performances] as [deck, performance]}-->
    <!--                <tr>-->
    <!--                    <td>{deck.label}</td>-->
    <!--                    <td>{displayPercentage(performance)}</td>-->
    <!--                    <td>{displayPercentage(deck.win_rate)}</td>-->
    <!--                </tr>-->
    <!--            {/each}-->
    <!--            </tbody>-->
    <!--        </table>-->
    <!--        {:else}-->
    <!--            <div id="alt-text-wrapper">-->
    <!--                <span>-->
    <!--                Select decks to counter to see recommended decks-->
    <!--                </span>-->
    <!--            </div>-->
    <!--        {/if}-->

</div>
<style>
    #wrapper {
        width: 40rem;
        padding: 1rem
    }

    #alt-text-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>