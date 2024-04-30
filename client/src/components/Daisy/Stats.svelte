<script lang="ts">
    type Stat = {
        title: string;
        value: string;
        desc?: string;
        iconName?: string;
    }

    export let stats: Stat[]
</script>
{#each stats as {title, value, desc, iconName}}
    <div class="stats shadow">
        <div class="stat">
            {#if iconName}
                <div class="stat-figure text-primary">
                    <span>{iconName}</span>
                </div>
            {/if}
            <div class="stat-title">{title}</div>
            <div class="stat-value text-primary">{value}</div>
            {#if desc}
                <div class="stat-desc">{desc}</div>
            {/if}
        </div>
    </div>
{/each}

