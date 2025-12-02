import { useEffect } from "react"
import { View, Platform, useWindowDimensions, ScrollView } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet } from "react-native-unistyles"

import { haptics } from "@/utils/haptics"

import { Text, Button, PricingCard, SubscriptionStatus, Container } from "../components"
import { useSubscriptionStore } from "../stores/subscriptionStore"
import type { PricingPackage } from "../types/subscription"

// =============================================================================
// CONSTANTS
// =============================================================================

const CONTENT_MAX_WIDTH = 600

// =============================================================================
// COMPONENT
// =============================================================================

export const PaywallScreen = () => {
  const { width: windowWidth } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const {
    isPro,
    platform,
    packages,
    loading,
    webSubscriptionInfo,
    customerInfo,
    fetchPackages,
    purchasePackage,
    restorePurchases,
  } = useSubscriptionStore()

  const isLargeScreen = windowWidth > 768
  const contentStyle = isLargeScreen
    ? {
        maxWidth: CONTENT_MAX_WIDTH,
        alignSelf: "center" as const,
        width: "100%" as unknown as number,
      }
    : {}

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  const handlePurchase = async (pkg: PricingPackage | any) => {
    haptics.buttonPress()
    const result = await purchasePackage(pkg)

    if (result.error) {
      haptics.error()
      console.error("Purchase failed:", result.error)
    } else {
      haptics.success()
    }
  }

  const handleRestore = async () => {
    haptics.buttonPress()
    const result = await restorePurchases()

    if (result.error) {
      haptics.error()
      console.error("Restore failed:", result.error)
    } else {
      haptics.success()
      console.log("Purchases restored successfully")
    }
  }

  // Get subscription info based on platform
  const subscriptionInfo = platform === "revenuecat-web" ? webSubscriptionInfo : null
  const revenueCatInfo = platform === "revenuecat" ? customerInfo : null

  // Helper to get package details
  const getPackageDetails = (pkg: any) => {
    // Check if it's a package with our PricingPackage interface
    if (pkg.platform) {
      return {
        title: pkg.title,
        price: pkg.priceString,
        description: pkg.description,
        billingPeriod: pkg.billingPeriod,
        identifier: pkg.identifier,
      }
    }

    // RevenueCat package
    return {
      title: pkg.product?.title || "Pro",
      price: pkg.product?.priceString || "$9.99",
      description: pkg.product?.description || "Unlock all features",
      billingPeriod:
        pkg.packageType?.toLowerCase && pkg.packageType.toLowerCase().includes("annual")
          ? "year"
          : "month",
      identifier: pkg.identifier || "unknown",
    }
  }

  // Features to display
  const features = [
    "Unlimited access to all features",
    "Priority support",
    "No ads",
    "Early access to new features",
  ]

  return (
    <Container safeAreaEdges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          contentStyle,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Animated.View entering={FadeInDown.delay(0).springify()}>
            <Text preset="heading" style={styles.title}>
              {isPro ? "Manage Subscription" : "Upgrade to Pro"}
            </Text>
            <Text style={styles.description}>
              {isPro
                ? "You're enjoying all Pro features!"
                : "Unlock all features and remove limits."}
            </Text>
          </Animated.View>

          {/* Subscription Status */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.statusContainer}
          >
            <SubscriptionStatus
              isPro={isPro}
              platform={platform}
              expirationDate={
                subscriptionInfo?.expirationDate || revenueCatInfo?.latestExpirationDate
              }
              willRenew={
                subscriptionInfo?.willRenew ||
                (revenueCatInfo?.entitlements?.active?.["pro"]?.willRenew ?? false)
              }
            />
          </Animated.View>

          {/* Pricing Packages */}
          {!isPro && packages.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.packagesContainer}
            >
              {packages.map((pkg, index) => {
                const details = getPackageDetails(pkg)
                const isAnnual =
                  details.billingPeriod === "year" || details.billingPeriod === "annual"

                return (
                  <Animated.View
                    key={details.identifier}
                    entering={FadeInDown.delay(250 + index * 50).springify()}
                  >
                    <PricingCard
                      title={details.title}
                      price={details.price}
                      description={details.description}
                      billingPeriod={details.billingPeriod}
                      features={features}
                      isPopular={isAnnual}
                      onPress={() => handlePurchase(pkg)}
                      disabled={loading}
                      loading={loading}
                    />
                  </Animated.View>
                )
              })}
            </Animated.View>
          )}

          {/* Platform Info */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.platformInfo}>
            <Text style={styles.platformText}>
              {Platform.OS === "web"
                ? "💳 Payments powered by RevenueCat Web Billing"
                : Platform.OS === "ios"
                  ? "🍎 Payments via App Store"
                  : "🤖 Payments via Google Play"}
            </Text>
          </Animated.View>

          {/* Restore Button - available on mobile and web */}
          {!isPro && (
            <Animated.View entering={FadeInDown.delay(350).springify()}>
              <Button
                text="Restore Purchases"
                variant="ghost"
                onPress={handleRestore}
                style={styles.restoreButton}
              />
            </Animated.View>
          )}

          {/* Terms */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Subscriptions auto-renew unless cancelled. Cancel anytime from your account settings.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create((theme) => ({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  container: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: theme.colors.background,
    maxWidth: 600,
    width: "100%",
  },
  title: {
    color: theme.colors.foreground,
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: theme.colors.foregroundSecondary,
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  statusContainer: {
    marginBottom: 24,
    width: "100%",
  },
  packagesContainer: {
    marginBottom: 24,
    width: "100%",
    gap: theme.spacing.md,
  },
  platformInfo: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  platformText: {
    color: theme.colors.foregroundSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  restoreButton: {
    marginBottom: 16,
  },
  termsContainer: {
    paddingHorizontal: 16,
  },
  termsText: {
    color: theme.colors.foregroundSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
}))
