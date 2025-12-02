/**
 * AuthScreenLayout - Consistent layout for authentication screens
 *
 * Use this layout for:
 * - Login, Register, ForgotPassword screens
 * - Welcome/Get Started screens
 * - Any authentication-related modal-style screens
 *
 * Features:
 * - Gradient background (theme-aware for dark mode)
 * - Modal card that slides up from bottom (mobile) or centered (web/tablet)
 * - Consistent spacing, typography, and styling
 * - Keyboard avoiding behavior
 * - Safe area handling
 *
 * @example
 * ```tsx
 * <AuthScreenLayout
 *   title="Welcome Back"
 *   subtitle="Sign in to continue"
 *   showCloseButton
 *   onClose={() => navigation.goBack()}
 * >
 *   {// Form content here //}
 * </AuthScreenLayout>
 * ```
 */

import { ReactNode } from "react"
import { View, KeyboardAvoidingView, Platform, useWindowDimensions, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconButton } from "../IconButton"
import { ScrollView } from "../ScrollView"
import { Text } from "../Text"

// =============================================================================
// TYPES
// =============================================================================

export interface AuthScreenLayoutProps {
  /** Main heading text */
  title?: string
  /** Subtitle/description below the title */
  subtitle?: string
  /** Screen content (form fields, buttons, etc.) */
  children: ReactNode
  /** Show close/back button in top right */
  showCloseButton?: boolean
  /** Handler for close button */
  onClose?: () => void
  /** Show back arrow button in top left */
  showBackButton?: boolean
  /** Handler for back button */
  onBack?: () => void
  /** Optional emoji/icon to display above title */
  headerIcon?: string
  /** Whether content should be scrollable (default: true) */
  scrollable?: boolean
  /** Additional style for the card container */
  cardStyle?: ViewStyle
  /** Whether to center content vertically in the card (default: false) */
  centerContent?: boolean
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MODAL_MAX_WIDTH = 480
const BREAKPOINT_LARGE = 768

// =============================================================================
// COMPONENT
// =============================================================================

export const AuthScreenLayout = ({
  title,
  subtitle,
  children,
  showCloseButton = false,
  onClose,
  showBackButton = false,
  onBack,
  headerIcon,
  scrollable = true,
  cardStyle,
  centerContent = false,
}: AuthScreenLayoutProps) => {
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()

  // Responsive layout
  const isLargeScreen = windowWidth > BREAKPOINT_LARGE
  const isWeb = Platform.OS === "web"

  // Content wrapper - either ScrollView or View
  const ContentWrapper = scrollable ? ScrollView : View

  const contentWrapperProps = scrollable
    ? {
        style: isWeb ? { flex: 1 } : undefined,
        contentContainerStyle: [
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 40) },
        ],
        keyboardShouldPersistTaps: "handled" as const,
        showsVerticalScrollIndicator: false,
      }
    : {
        style: [
          styles.staticContent,
          { paddingBottom: Math.max(insets.bottom, 40) },
          centerContent && styles.centeredContent,
        ],
      }

  const modalCardWidthStyle = isWeb
    ? isLargeScreen
      ? styles.modalCardMaxWidth
      : styles.modalCardFullWidth
    : undefined

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, isWeb && isLargeScreen && styles.gradientCentered]}
      >
        <View
          style={[
            styles.safeArea,
            isWeb && styles.safeAreaWeb,
            isWeb && isLargeScreen && styles.safeAreaCentered,
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View
              style={[
                styles.modalCard,
                isWeb && styles.modalCardWeb,
                modalCardWidthStyle,
                cardStyle,
              ]}
            >
              <ContentWrapper {...contentWrapperProps}>
                {/* Close Button (top right) */}
                {showCloseButton && onClose && (
                  <View style={styles.closeButton}>
                    <IconButton icon="close" variant="ghost" size="md" onPress={onClose} />
                  </View>
                )}

                {/* Back Button (top left) */}
                {showBackButton && onBack && (
                  <View style={styles.backButton}>
                    <IconButton icon="arrow-back" variant="ghost" size="md" onPress={onBack} />
                  </View>
                )}

                {/* Header Icon */}
                {headerIcon && (
                  <View style={styles.headerIconContainer}>
                    <Text style={styles.headerIcon}>{headerIcon}</Text>
                  </View>
                )}

                {/* Title */}
                {title && (
                  <Text size="3xl" weight="bold" style={styles.title}>
                    {title}
                  </Text>
                )}

                {/* Subtitle */}
                {subtitle && (
                  <Text color="secondary" style={styles.subtitle}>
                    {subtitle}
                  </Text>
                )}

                {/* Content */}
                <View style={styles.content}>{children}</View>
              </ContentWrapper>
            </View>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    ...(Platform.OS === "web" && {
      minHeight: "100vh" as unknown as number,
      height: "100vh" as unknown as number,
      width: "100vw" as unknown as number,
    }),
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    ...(Platform.OS === "web" && {
      minHeight: "100vh" as unknown as number,
      height: "100vh" as unknown as number,
      width: "100%" as unknown as number,
    }),
  },
  gradientCentered: {
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    width: "100%",
  },
  safeAreaWeb: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },
  safeAreaCentered: {
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  keyboardView: {
    width: "100%",
    ...(Platform.OS === "web" && {
      alignItems: "center",
    }),
  },
  modalCard: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius["3xl"],
    borderTopRightRadius: theme.radius["3xl"],
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    ...theme.shadows.xl,
  },
  modalCardWeb: {
    borderRadius: theme.radius["3xl"],
    width: "100%",
    // Web needs max-height to enable scrolling inside the card
    maxHeight: "90vh" as unknown as number,
    overflow: "auto" as unknown as "visible",
  },
  modalCardMaxWidth: {
    maxWidth: MODAL_MAX_WIDTH,
  },
  modalCardFullWidth: {
    maxWidth: "100%" as unknown as number,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flexGrow: 1,
  },
  centeredContent: {
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 10,
  },
  headerIconContainer: {
    marginBottom: theme.spacing.md,
  },
  headerIcon: {
    fontSize: 32,
    lineHeight: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  content: {
    // Content takes remaining space
  },
}))
