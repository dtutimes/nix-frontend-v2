/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_NIX_BACKEND: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}