import { useCallback, useEffect, useState } from "react"
import { Platform } from "react-native"
import { MMKV, useMMKVString as useMMKVStringNative } from "react-native-mmkv"

// Web-compatible localStorage wrapper with MMKV-like interface
const webStorage = {
  getString: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  delete: (key: string) => localStorage.removeItem(key),
  clearAll: () => localStorage.clear(),
  getAllKeys: () => Object.keys(localStorage),
  // Stub for MMKV-specific methods that aren't available on web
  addOnValueChangedListener: () => ({ remove: () => {} }),
}

export const storage = Platform.OS === "web" ? webStorage : new MMKV()

/**
 * Web-compatible useMMKVString hook
 * Uses localStorage on web, native MMKV on mobile
 */
export function useMMKVString(
  key: string,
  instance?: typeof storage,
): [string | undefined, (value: string | undefined) => void] {
  if (Platform.OS !== "web") {
    // On native, use the real hook
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMMKVStringNative(key, instance as MMKV)
  }

  // On web, use localStorage with React state
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState<string | undefined>(() => {
    const stored = localStorage.getItem(key)
    return stored ?? undefined
  })

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setStoredValue = useCallback(
    (newValue: string | undefined) => {
      if (newValue === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, newValue)
      }
      setValue(newValue)
    },
    [key],
  )

  // Listen for storage changes from other tabs/windows
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setValue(e.newValue ?? undefined)
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key])

  return [value, setStoredValue]
}

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export function loadString(key: string): string | null {
  try {
    return storage.getString(key) ?? null
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function saveString(key: string, value: string): boolean {
  try {
    storage.set(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export function load<T>(key: string): T | null {
  let almostThere: string | null = null
  try {
    almostThere = loadString(key)
    return JSON.parse(almostThere ?? "") as T
  } catch {
    return (almostThere as T) ?? null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export function remove(key: string): void {
  try {
    storage.delete(key)
  } catch {}
}

/**
 * Burn it all to the ground.
 */
export function clear(): void {
  try {
    storage.clearAll()
  } catch {}
}
