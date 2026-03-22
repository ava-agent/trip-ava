/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_API: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_DID_API_KEY: string
  readonly VITE_DID_API_URL: string
  readonly VITE_ENABLE_VOICE_FEATURES: string
  readonly VITE_ENABLE_IMAGE_FEATURES: string
  readonly VITE_ENABLE_VIDEO_FEATURES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
