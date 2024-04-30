<script lang="ts">
    import {getChampionImageUrl} from "../../utils/lor"
    export let deck

    // const imageUrls = deck
    console.log({deck})
    const champImageUrls = deck.assets.champions.map(champion => {
        const championCode = champion[1]
        return getChampionImageUrl(championCode)
    })
</script>

<div class="champion-icons">
    {#each champImageUrls as championImage}
        <img src={championImage} alt="Champion" class="champion-icon">
    {/each}
</div>

<style>
    .champion-icons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        flex-wrap: wrap;
        /*width: 33%*/
    }

    .champion-icon {
        border-radius: 50%;
        position: relative;
        width: 4rem;
        height: 4rem;
    }
</style>


