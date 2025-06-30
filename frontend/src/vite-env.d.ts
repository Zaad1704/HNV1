/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string;

// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Fetch with timeout type extension
declare global {
  interface RequestInit {
    timeout?: number;
  }
}
