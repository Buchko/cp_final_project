<script lang="ts">
    import {getChampionImageUrl} from "../../../utils/lor"
    import {buildStyleString} from "../../../utils/utils"
    import {zoom} from "../../../utils/store"
    import {getNodeSize} from "../../GraphStyles";

    export let node

    // const imageUrls = deck
    let champImageUrls
    $:{
        if (node) {
            champImageUrls = node.data().assets.champions.map(champion => {
                const championCode = champion[1]
                return getChampionImageUrl(championCode)
            })
        }
    }

    let initialSize = getNodeSize(node)
    $: {
        if (node){
            initialSize = getNodeSize(node)
        }
    }
    let size = 1
    const buildWrapperStyle = (size) => {
        return {
            width: size + "px",
            height: size + "px"
        }
    }
    zoom.subscribe(val => {
        size = initialSize * val
    })

    const getIconRadius = (numIcons, outerRadius) => {
        if (numIcons === 1) {
            return outerRadius
        } else if (numIcons === 2) {
            return 0.95 * (outerRadius / 2)
        } else {
            return ((Math.sqrt(3) - 1) / 2 * outerRadius)
        }
    }

    const buildIconDims = (numIcons, size) => {
        const radius = getIconRadius(numIcons, size)
        return {
            width: radius + "px",
        }
    }


</script>

<div class="champion-icons" style={buildStyleString(buildWrapperStyle(size))}>
    {#each champImageUrls.slice(0, 3) as championImage}
        <img src={championImage} alt="Champion" class="champion-icon"
             style={buildStyleString(buildIconDims(champImageUrls.length, size))}>
    {/each}
</div>

<style>
    .champion-icons {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        align-content: center;
        min-height: 0;
        min-width: 0;
        cursor: pointer;
    }

    .champion-icon {
        border-radius: 50%;
        /*position: relative;*/
        /*flex-grow: 1;*/
        /*flex-shrink: 1;*/
    }
</style>
