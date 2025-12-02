/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MODE?: 'waitlist' | 'launch'
    readonly VITE_APP_NAME?: string
    readonly VITE_APP_DESCRIPTION?: string
    readonly VITE_APP_URL?: string
    readonly VITE_OG_IMAGE?: string
    readonly VITE_WAITLIST_API_ENDPOINT?: string
    readonly VITE_IOS_APP_URL?: string
    readonly VITE_ANDROID_APP_URL?: string
    readonly VITE_APP_SCREENSHOT_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
