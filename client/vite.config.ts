import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    server: {
        proxy: {
            "/api": "https://tvnr8llrik.execute-api.us-west-2.amazonaws.com/prod",
        },
    },
});
