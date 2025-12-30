import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'
import react from "@vitejs/plugin-react-swc"
import path from 'path'
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
    base: './',
    plugins: [
        react(),
        mode === "development" && componentTagger(),
        electron({
            main: {
                entry: 'electron/main.js',
            },
            preload: {
                input: 'electron/preload.js',
            },
            renderer: {},
        }),
    ].filter(Boolean),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: "::",
        port: 8080,
    },
}))
