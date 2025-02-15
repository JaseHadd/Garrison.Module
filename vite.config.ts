import { defineConfig } from "vite";

export default defineConfig({
    build:
    {
        outDir: "scripts",
        sourcemap: true,
        minify: "esbuild",
        lib: {
            entry: [ "src/module/main.ts" ],
            formats: ["iife"],
            name: "app",
            fileName: (format, entry) => `${entry}.js`
        },
        watch: {
            buildDelay: 3000
        }
    }
});