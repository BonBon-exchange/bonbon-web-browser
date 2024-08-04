import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    plugins: [

    ],
    server: {
        port: 3000, // Ensure the server is running on the correct port
    },
    optimizeDeps: {
        include: ["@emotion/react"],
        esbuildOptions: {
            target: "es2022",
        },
    },
    resolve: {
        dedupe: ["@emotion/react"],
        alias: {
            "@icons": path.resolve(__dirname, "src/assets/icons"),
            "src": path.resolve(__dirname, "src"),
        },
    },
    build: {
        target: "es2022",
        rollupOptions: {
            external: [],
        },
    },
});
