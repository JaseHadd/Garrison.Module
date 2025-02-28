import { defineConfig } from "vite";
import copy from "rollup-plugin-copy"

export default defineConfig({
    optimizeDeps: {
        include: ['src/styles/*.scss']
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly'
        }
    },
    build:
    {
        outDir: "scripts",
        sourcemap: true,
        minify: "esbuild",
        rollupOptions: {
            input: "src/module/main.ts",
            output: {
                dir: "dist/scripts",
                entryFileNames: "[name].js",
                format: "es"
            }
        },
        watch:
        {
            buildDelay: 1200
        }
    },
    plugins: [
        copy({
            targets: [
                { src: "src/module.json", dest: "dist" },
                { src: "src/templates", dest: "dist" },
                { src: "src/styles", dest: "dist" },
                { src: "icons", dest: "dist" },
                { src: "lang", dest: "dist" }
            ],
            hook: "writeBundle",
            copyOnce: true,
            overwrite: true
        })
    ]
});