<script lang="ts">
    import {onMount, setContext} from 'svelte'
    import cytoscape from 'cytoscape'
    import dagre from 'cytoscape-dagre'
    import {style} from './GraphStyles'

    export let nodes
    export let edges

    setContext('graphSharedState', {
        getCyInstance: () => cyInstance
    })

    let refElement: HTMLElement | null = null
    let cyInstance: cytoscape.Core | null = null

    onMount(() => {
        cytoscape.use(dagre)

        cyInstance = cytoscape({
            container: refElement,
            style
        })
        cyInstance.add(nodes)
        cyInstance.add(edges)

        cyInstance
            .makeLayout({
                name: 'dagre',
                // @ts-ignore trust me
                rankDir: 'TB',
                nodeSep: 150
            })
            .run()
    })

</script>

<div class="graph" bind:this={refElement} id="cy">
</div>

<style>
    #cy {
        width: 2000px;
        height: 2000px;
        display: block;
    }
</style>