import { useEffect, useState } from "react"
import NetInfo from "@react-native-community/netinfo"

/**
 * Hook to detect network connectivity status
 * Returns true when connected, false when offline
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Get initial network state
    const getInitialState = async () => {
      const state = await NetInfo.fetch()
      setIsConnected(state.isConnected ?? false)
      setIsLoading(false)
    }

    getInitialState()

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    isConnected,
    isOffline: !isConnected,
    isLoading,
  }
}