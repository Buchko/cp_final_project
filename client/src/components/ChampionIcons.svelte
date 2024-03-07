<script lang="ts">
    import {getRestOfChampionImages} from "../utils/lor"
    import {getNodeSize} from "../components/GraphStyles"
    import {zoom} from "../utils/store"
    import {remToPx} from "../utils/math";

    export let node

    const desiredPadding = 1
    let offset = 0

    console.log("polar", { node })
    const championImages = getRestOfChampionImages(node.data())
    const initialSize = getNodeSize(node)
    let size = initialSize * $zoom * 0.5
    zoom.subscribe((val) => {
        size = initialSize * val * 0.5
        offset = size + remToPx(desiredPadding) * val * 0.1
    })
</script>

<div class="champion-icons">
    {#each championImages as championImage}
        <img src={championImage} alt="Champion" class="champion-icon" width={size}, height={size}
             style={`top:${ -1 * offset }px`}>
    {/each}
</div>

<style>
    .champion-icons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .champion-icon {
        border-radius: 50%;
        position: relative;
    }
</style>


