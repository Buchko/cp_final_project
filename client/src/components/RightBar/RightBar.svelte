<script lang="ts">
    import {
        storetargetedNodes,
        storeWinningNodes,
        winrateThreshold,
        rightBarMouseIn,
        rightBarMouseOut
    } from "../../utils/store.js"
    import {weightedAverage} from "../../utils/math.js"
    import {displayPercentage} from "../../utils/utils"
    import RightChampionIcons from "./RightChampionIcons.svelte";
    import Stat from "../Daisy/Stats.svelte"

    export let nodes: any[]
    export let edges: any[]
    let performances: [object, { weightedWinRate: number, numWinningMatchups: number }][]

    const calculateTable = (nodes, edges, targetedNodes, winningNodes, winrateThreshold) => {
        if (!nodes || !edges || !targetedNodes || !winningNodes) return
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
                const numWinningMatchups = winRates.filter(winRate => winRate >= winrateThreshold).length
                return {weightedWinRate: weightedAverage(weights, winRates), numWinningMatchups}
            }
        const performances = winningNodes.map(node => [node.data(), getAverageMUWinrate(node)])
        const sortedPerformances = performances.sort((a, b) => {
            const numWinningMatchupsDiff = b[1].numWinningMatchups - a[1].numWinningMatchups
            if (numWinningMatchupsDiff !== 0) {
                return numWinningMatchupsDiff
            }
            return b[1].weightedWinRate - a[1].weightedWinRate
        })
        return new Map(sortedPerformances)
    }

    function deckNameToUrl(deckName, mode) {
        //replace special characters with spaces
        let deckNameForUrl = deckName.replace(/[()\/]/g, ' ');
        //replace duplicate white space with spaces
        deckNameForUrl = deckNameForUrl.replace(/\s+/g, '-');
        //replace spaces with dashes
        deckNameForUrl = deckNameForUrl.replace(/\s/g, '-');
        //remove special characters
        deckNameForUrl = deckNameForUrl.replace(/[^a-zA-Z0-9-]/g, '');
        //remove last dash if it's there
        if (deckNameForUrl[deckNameForUrl.length - 1] === '-') {
            deckNameForUrl = deckNameForUrl.slice(0, -1)
        }
        //make all lowercase
        deckNameForUrl = deckNameForUrl.toLowerCase();
        const url = `https://masteringruneterra.com/archetype/${deckNameForUrl}/${mode}/three/everyone/`;
        return url;
    }

    const handleMouseEnter = (node) => {
        rightBarMouseIn.set(node)
    }

    const handleMouseLeave = (node) => {
        rightBarMouseOut.set(node)
    }


    //subscriber functions
    storetargetedNodes.subscribe(_ => performances = calculateTable(nodes, edges, $storetargetedNodes, $storeWinningNodes, $winrateThreshold))
    storeWinningNodes.subscribe(_ => performances = calculateTable(nodes, edges, $storetargetedNodes, $storeWinningNodes, $winrateThreshold))
    winrateThreshold.subscribe(_ => performances = calculateTable(nodes, edges, $storetargetedNodes, $storeWinningNodes, $winrateThreshold))
</script>
<div id="wrapper">
    <div id="header">
        <h2 class="text-4xl">
            Recommended Decks
        </h2>
    </div>
    {#if performances && performances.size > 0}
        {#each [...performances] as [deck, {weightedWinRate: performance, numWinningMatchups}]}
            <div class="collapse collapse-arrow bg-base-200" on:mouseenter={(_) => handleMouseEnter(deck)} role="button"
                 tabindex="0" on:mouseleave={(_) => handleMouseLeave(deck)}>
                <input type="radio" name="my-accordion-1">
                <div class="collapse-title text-xl font-medium deck">
                    <RightChampionIcons deck={deck}/>
                    <div class="deck-name">{deck.label}</div>
                </div>
                <div class="collapse-content">
                    <Stat stats={
                    [
                        {title: "# of Targets Beat", value: numWinningMatchups.toString()},
                        {title: "Win Rate Againts Targets", value: displayPercentage(performance), desc: "Win rate against targets weighted by each target's play rate"},
                        {title: "Play Rate", value: displayPercentage(deck.play_rate)},
                        {title: "Global Win Rate", value: displayPercentage(deck.win_rate)},
                    ]
                    }/>
                    <div class="leave-link">
                        <span class="material-symbols-outlined">
                            exit_to_app
                        </span>
                        <a class="link link-primary text-2xl" href={deckNameToUrl(deck.label, "standard")} target="_blank">View
                            deck list at
                            Mastering Runeterra</a>
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

</div>
<style>
    #wrapper {
        width: 40rem;
        padding: 1rem;
        height: 100vh;
        overflow-y: scroll;
    }

    #alt-text-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .leave-link {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .deck {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .deck-name {
        width: 66%
    }

    #header{
        border-radius: 1rem;
        background-color: var(--surface0);
        padding: 1rem;
    }
    /*.collapse{*/
    /*    background-color: var(--surface0);*/
    /*}*/
</style>