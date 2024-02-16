<script lang="ts">
  import {writable} from "svelte/store";
  import {winrateThreshold, selectedNodesList, showLosingMatchups} from "../../utils/store"

  export let archetypes
  console.log({archetypes})

  const handleWinrateSliderChange = (event) => {
    const value = parseFloat(event.target.value)
    winrateThreshold.set(value)
  }

  const handleCheck  = (event) => {
    console.log(event.target)
    const {id} = event.target
    if (event.target.checked) {
      //adding to the list
      selectedNodesList.update(nodes => [...nodes, id])
    } else {
      //removing it
      selectedNodesList.update(nodes => nodes.filter(node => node != id))
    }
  }
  const handleMethodToggle = (event) => {
    showLosingMatchups.set(event.target.checked)
  }

</script>

<div id="sidebar">
    <div class="threshold">
      <h1>winrate threshold</h1>
      <div class="slider-wrapper">
        <input  type="range" min="0.5" max="1" value={$winrateThreshold} class="range range-primary" step="0.05" on:input="{handleWinrateSliderChange}"/>
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
  <div class="counters">
    <h1>I want to counter</h1>
    {#each archetypes as archetype}
      <div>
        <input type="checkbox" checked={$selectedNodesList.includes(archetype.id)} class="checkbox checkbox-primary" on:input={handleCheck} id="{archetype.id}"/>
        <span class="archetype">{archetype.label}</span>
      </div>
      {/each}

  </div>
  <div class="methodToggle">
    <h1>Show losing matchups?</h1>
    <input type="checkbox" class="toggle toggle-success" on:input={handleMethodToggle}/>
    </div>
</div>

<style lang="postcss">
  div#sidebar{
    width: 20rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  div.threshold{
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
  }

  span.archetype{
  }

  h1{
    font-size: 1.5rem;
  }
</style>