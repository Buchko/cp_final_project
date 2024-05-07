<script lang="ts">
    import {writable} from "svelte/store";
    import {winrateThreshold, targetedNodesList, showLosingMatchups, considerTargets} from "../../utils/store"

    export let archetypes

    const handleWinrateSliderChange = (event) => {
        const value = parseFloat(event.target.value)
        winrateThreshold.set(value)
    }

    const handleCheck = (event) => {
        const {id} = event.target
        if (event.target.checked) {
            //adding to the list
            targetedNodesList.update(nodes => [...nodes, id])
        } else {
            //removing it
            targetedNodesList.update(nodes => nodes.filter(node => node != id))
        }
    }
    const handleMethodToggle = (event) => {
        showLosingMatchups.set(event.target.checked)
    }

    const handleConsiderTargets = (event) => {
        considerTargets.set(event.target.checked)
    }

</script>

<div id="sidebar">
    <div id="content">
        <div class="counters">
            <header>
                <h1 class="text-4xl">I want to counter...</h1>
            </header>
            {#each archetypes as archetype}
                <div>
                    <input type="checkbox" checked={$targetedNodesList.includes(archetype.id)}
                           class="checkbox checkbox-primary" on:input={handleCheck} id="{archetype.id}"/>
                    <span class="archetype">{archetype.label}</span>
                </div>
            {/each}
        </div>
        <div class="threshold">
            <h1 class="text-2xl">winrate threshold</h1>
            <div class="slider-wrapper">
                <input type="range" min="0.5" max="1" value={$winrateThreshold} class="range range-primary" step="0.05"
                       on:input="{handleWinrateSliderChange}"/>
                <div class="w-full flex justify-between text-xs px-2">
                    <span>0.5</span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span>1</span>
                </div>
            </div>
            <span>only drawing lines where the winrate is >= {Math.round(100 * $winrateThreshold)}%</span>
        </div>
        <div class="methodToggle">
            <h1 class="text-2xl">Show losing matchups?</h1>
            <input type="checkbox" class="toggle toggle-success" on:input={handleMethodToggle}/>
        </div>
        <div class="methodToggle">
            <h1 class="text-2xl">Consider Targets?</h1>
            <input type="checkbox" class="toggle toggle-success" on:input={handleConsiderTargets}/>
        </div>
    </div>
    <div id="footer">
        Deck performance and match-up data is obtained from <a class="link link-primary" href="https://masteringruneterra.com/">https://masteringruneterra.com/</a>
    </div>
</div>

<style lang="postcss">
    div#sidebar {
        width: 30rem;
        height: 100vh;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1rem;
        background-color: var(--surface0);
        border-radius: 1rem;
        overflow-y: auto;
        justify-content: space-between;
    }

    div.threshold {
        display: flex;
        gap: 0.5rem;
        flex-direction: column;
    }

    header {
        padding: 1rem;
    }
</style>