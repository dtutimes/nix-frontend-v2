import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {fileURLToPath} from 'node:url';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))    }
  }
});


// import { defineConfig } from 'vite'
// import path from 'path'
// import react from '@vitejs/plugin-react'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// export default defineConfig({
//   plugins: [react()],
//   rollupOptions: {
//     input: {
//       main: path.resolve(__dirname, 'index.html'),
//     },
//   },

// })
