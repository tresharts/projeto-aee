/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_DATA_MODE?: 'demo' | 'api'
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
