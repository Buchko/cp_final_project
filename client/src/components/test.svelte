<script>
  import { onMount } from 'svelte';

  onMount(() => {
    const interval = setInterval(() => {
    }, 1000);

    return () => clearInterval(interval);
  })
</script>