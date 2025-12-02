/**
 * Network Monitor Service
 *
 * Monitors network connectivity and provides offline/online state management
 */

import { useEffect, useState } from "react"
import NetInfo, { NetInfoState } from "@react-native-community/netinfo"

import { trackEvent } from "../utils/analytics"
import { logger } from "../utils/Logger"

/**
 * Network quality levels
 */
export enum NetworkQuality {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
  OFFLINE = "OFFLINE",
}

/**
 * Network state
 */
export interface NetworkState {
  isConnected: boolean
  isInternetReachable: boolean
  type: string
  quality: NetworkQuality
}

/**
 * Determine network quality based on connection type and details
 */
function determineNetworkQuality(state: NetInfoState): NetworkQuality {
  if (!state.isConnected) {
    return NetworkQuality.OFFLINE
  }

  // WiFi is generally good
  if (state.type === "wifi") {
    return NetworkQuality.EXCELLENT
  }

  // Cellular - check generation
  if (state.type === "cellular") {
    const details = state.details as any
    if (details?.cellularGeneration === "5g") {
      return NetworkQuality.EXCELLENT
    }
    if (details?.cellularGeneration === "4g") {
      return NetworkQuality.GOOD
    }
    if (details?.cellularGeneration === "3g") {
      return NetworkQuality.FAIR
    }
    return NetworkQuality.POOR
  }

  // Other types
  return NetworkQuality.GOOD
}

/**
 * Network Monitor class
 */
class NetworkMonitor {
  private currentState: NetworkState | null = null
  private listeners: Set<(state: NetworkState) => void> = new Set()
  private unsubscribe: (() => void) | null = null

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Get initial state
      const netInfoState = await NetInfo.fetch()
      this.updateState(netInfoState)

      // Subscribe to network state changes
      this.unsubscribe = NetInfo.addEventListener((state) => {
        this.updateState(state)
      })

      logger.info("Network monitor initialized", {
        isConnected: this.currentState?.isConnected,
        quality: this.currentState?.quality,
      })
    } catch (error) {
      logger.error("Failed to initialize network monitor", {}, error as Error)
    }
  }

  /**
   * Update network state
   */
  private updateState(netInfoState: NetInfoState): void {
    const previousState = this.currentState

    const newState: NetworkState = {
      isConnected: netInfoState.isConnected ?? false,
      isInternetReachable: netInfoState.isInternetReachable ?? false,
      type: netInfoState.type,
      quality: determineNetworkQuality(netInfoState),
    }

    this.currentState = newState

    // Log state changes
    if (previousState) {
      if (previousState.isConnected !== newState.isConnected) {
        const event = newState.isConnected ? "network_connected" : "network_disconnected"
        logger.info(`Network ${newState.isConnected ? "connected" : "disconnected"}`, {
          type: newState.type,
          quality: newState.quality,
        })
        trackEvent(event, {
          type: newState.type,
          quality: newState.quality,
        })
      }

      if (previousState.quality !== newState.quality) {
        logger.debug("Network quality changed", {
          from: previousState.quality,
          to: newState.quality,
        })
      }
    }

    // Notify listeners
    this.notifyListeners(newState)
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(state: NetworkState): void {
    this.listeners.forEach((listener) => {
      try {
        listener(state)
      } catch (error) {
        logger.error("Network listener error", {}, error as Error)
      }
    })
  }

  /**
   * Add a listener for network state changes
   */
  addListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.add(listener)

    // Call listener immediately with current state
    if (this.currentState) {
      listener(this.currentState)
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get current network state
   */
  getState(): NetworkState | null {
    return this.currentState
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.currentState?.isConnected ?? false
  }

  /**
   * Check if internet is reachable
   */
  isInternetReachable(): boolean {
    return this.currentState?.isInternetReachable ?? false
  }

  /**
   * Get current network quality
   */
  getQuality(): NetworkQuality {
    return this.currentState?.quality ?? NetworkQuality.OFFLINE
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.listeners.clear()
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor()

/**
 * React hook to use network state
 */
export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: "unknown",
    quality: NetworkQuality.GOOD,
  })

  useEffect(() => {
    const unsubscribe = networkMonitor.addListener(setState)
    return unsubscribe
  }, [])

  return state
}

/**
 * React hook to check if online
 */
export function useIsOnline(): boolean {
  const state = useNetworkState()
  return state.isConnected
}

/**
 * React hook to get network quality
 */
export function useNetworkQuality(): NetworkQuality {
  const state = useNetworkState()
  return state.quality
}
