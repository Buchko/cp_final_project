<script lang="ts">
    import {buildStyleString} from "../../utils/utils";

    export let x = 0
    export let y = 0

    let width = 10
    let height = 10

    const computeStyle = ({width, height, x, y}) => {
        const ans = ({
            top: Math.round(y - (height / 2)) + "px",
            left: Math.round(x - Math.floor(width /2)) + "px"
            // top: Math.round(y) + "px",
            // left: Math.round(x) + "px",
            // width: "10px",
            // height: "10px"
        })
        return ans
    }
</script>
<div id="wrapper" bind:clientWidth={width} bind:clientHeight={height}
     style={buildStyleString(computeStyle({x, y, width, height}))}>
    <slot></slot>
</div>
<style>
    #wrapper {
        position: absolute;
        z-index: 10;
        display: inline-block;
    }
</style>