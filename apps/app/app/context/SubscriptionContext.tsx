import { createContext, useContext, useEffect, useState } from "react"

import { useAuth } from "./AuthContext"
import { revenueCat } from "../services/revenuecat"
import type { SubscriptionInfo } from "../types/subscription"

type SubscriptionContextType = {
  isPro: boolean
  subscriptionInfo: SubscriptionInfo | null
  restorePermissions: () => Promise<SubscriptionInfo | null>
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  subscriptionInfo: null,
  restorePermissions: async () => null,
})

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [isPro, setIsPro] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      if (user) {
        const { subscriptionInfo: info } = await revenueCat.logIn(user.id)
        setSubscriptionInfo(info)
        setIsPro(info.isActive)
      } else {
        const { subscriptionInfo: info } = await revenueCat.logOut()
        setSubscriptionInfo(info)
        setIsPro(false)
      }
    }

    handleAuth()
  }, [user])

  useEffect(() => {
    // Set up subscription update listener
    const unsubscribe = revenueCat.addSubscriptionUpdateListener?.((info) => {
      setSubscriptionInfo(info)
      setIsPro(info.isActive)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  const restorePermissions = async (): Promise<SubscriptionInfo | null> => {
    try {
      const { subscriptionInfo: info, error } = await revenueCat.restorePurchases()

      if (error) {
        console.error("Restore failed:", error)
        return null
      }

      setSubscriptionInfo(info)
      setIsPro(info.isActive)
      return info
    } catch (e) {
      console.error(e)
      return null
    }
  }

  return (
    <SubscriptionContext.Provider value={{ isPro, subscriptionInfo, restorePermissions }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
