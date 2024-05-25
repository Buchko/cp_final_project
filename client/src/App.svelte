<script lang="ts">
    import {Router, Route} from "svelte-routing";
    import LorEternal from "./LorEternal.svelte";
    import LorStandard from "./LorStandard.svelte";
    console.log("polar from router")
</script>

<Router>
    <div>
        <Route path="/eternal" component={LorEternal}/>
        <Route path="/standard" component={LorStandard}/>
        <Route path="/" component={LorStandard}/>
    </div>
</Router>