/**
 * Store Generator Script
 *
 * Generates a new Zustand store with middleware and selectors
 * Usage: node scripts/generate/store.js <storeName>
 */

const fs = require("fs")
const path = require("path")

const storeName = process.argv[2]

if (!storeName) {
  console.error("Please provide a store name (e.g. settings)")
  process.exit(1)
}

const capitalizedName = storeName.charAt(0).toUpperCase() + storeName.slice(1)
const storeDir = path.join(__dirname, "../../app/stores")
const storeFile = path.join(storeDir, `${storeName}Store.ts`)

const storeTemplate = `import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { loggerMiddleware, errorHandlerMiddleware } from './middleware'
import * as storage from '../utils/storage'

interface ${capitalizedName}State {
  // State
  isLoading: boolean
  
  // Actions
  setLoading: (isLoading: boolean) => void
  reset: () => void
}

const initialState = {
  isLoading: false,
}

// Custom storage adapter
const mmkvStorage = {
  getItem: async (name: string) => {
    const value = storage.load(name)
    return value ? JSON.stringify(value) : null
  },
  setItem: async (name: string, value: string) => {
    storage.save(name, JSON.parse(value))
  },
  removeItem: async (name: string) => {
    storage.remove(name)
  },
}

export const use${capitalizedName}Store = create<${capitalizedName}State>()(
  loggerMiddleware(
    errorHandlerMiddleware(
      persist(
        (set) => ({
          ...initialState,

          setLoading: (isLoading) => set({ isLoading }),

          reset: () => set(initialState),
        }),
        {
          name: '${storeName}-storage',
          storage: createJSONStorage(() => mmkvStorage),
        }
      )
    ),
    '${capitalizedName}Store'
  )
)
`

// Check if store already exists
if (fs.existsSync(storeFile)) {
  console.error(`Store ${storeName}Store already exists`)
  process.exit(1)
}

// Write file
fs.writeFileSync(storeFile, storeTemplate)

console.log(`✅ Created store ${storeName}Store at ${storeFile}`)
