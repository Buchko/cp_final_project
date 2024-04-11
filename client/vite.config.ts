import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    server: {
        proxy: {
            "/api": "http://localhost:8000", // Replace <backend_port> with your actual backend port
            // You can add multiple proxy routes here
        },
    },
});
