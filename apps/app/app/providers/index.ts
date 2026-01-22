export { QueryProvider } from "./QueryProvider"
export { BackendProvider, useBackend, useBackendContext, withBackend } from "./BackendProvider"

// Note: ConvexProvider, ConvexAuthSync, and related exports are not re-exported here
// to prevent eager loading of Convex packages when using Supabase backend.
// If you need to use them directly, import from the specific files:
// import { ConvexProvider } from "@/providers/ConvexProvider"
// import { ConvexAuthSync } from "@/providers/ConvexAuthSync"
