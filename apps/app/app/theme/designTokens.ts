/**
 * Design Tokens - Modern Design System
 *
 * This file contains all design tokens used throughout the app.
 * When adding new screens or components, import and use these tokens
 * to maintain visual consistency.
 *
 * @example
 * import { designTokens } from '@/theme/designTokens'
 *
 * const styles = StyleSheet.create({
 *   button: {
 *     backgroundColor: designTokens.colors.primary,
 *     borderRadius: designTokens.borderRadius.lg,
 *     paddingVertical: designTokens.spacing.md,
 *   }
 * })
 */

export const designTokens = {
  /**
   * COLOR SYSTEM
   * Modern gradient-based color palette
   */
  colors: {
    // Primary Colors
    primary: "#000000", // Black - primary buttons & important text
    secondary: "#F3F4F6", // Light gray - secondary buttons

    // Text Colors
    textPrimary: "#000000", // Main text
    textSecondary: "#6B7280", // Subtitles, descriptions
    textTertiary: "#9CA3AF", // Placeholders, disabled text
    textLabel: "#374151", // Input labels

    // Background Colors
    backgroundLight: "#F9FAFB", // Light backgrounds, inputs
    backgroundMedium: "#F3F4F6", // Medium backgrounds, secondary elements
    backgroundWhite: "#FFFFFF", // Cards, modals

    // Gradient Colors (for LinearGradient)
    gradientStart: "#E0F2FE", // Light blue
    gradientMiddle: "#FAF5FF", // Light purple
    gradientEnd: "#FEF2F2", // Light pink

    // Semantic Colors
    error: "#DC2626", // Error messages
    errorBackground: "#FEE2E2", // Error containers
    success: "#22C55E", // Success messages
    successBackground: "#F0FDF4", // Success containers

    // Border Colors
    border: "#E5E7EB", // Standard borders
    borderLight: "#F3F4F6", // Light borders

    // Overlay/Transparent
    overlay: "rgba(0, 0, 0, 0.5)",
    frosted: "rgba(255, 255, 255, 0.5)",
    transparent: "transparent",
  },

  /**
   * TYPOGRAPHY SYSTEM
   * Font sizes and line heights
   */
  typography: {
    // Headings
    headingXL: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "bold" as const,
    },
    headingLG: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "bold" as const,
    },
    headingMD: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "bold" as const,
    },

    // Body Text
    bodyLG: {
      fontSize: 17,
      lineHeight: 26,
      fontWeight: "normal" as const,
    },
    bodyMD: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "normal" as const,
    },
    bodySM: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "normal" as const,
    },

    // Labels & Captions
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600" as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "normal" as const,
    },

    // Button Text
    button: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: "600" as const,
    },
  },

  /**
   * SPACING SYSTEM
   * Consistent spacing scale
   */
  spacing: {
    xxxs: 2,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  /**
   * BORDER RADIUS
   * Rounded corners for modern UI
   */
  borderRadius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999, // Fully rounded (pills, circles)
    card: 32, // Cards and modals
  },

  /**
   * SHADOWS
   * Elevation system for depth
   */
  shadows: {
    // Small shadow for subtle elevation
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    // Medium shadow for buttons
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    // Large shadow for cards
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    // Extra large shadow for modals
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
    // Bottom shadow for bottom sheets
    bottom: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  /**
   * COMPONENT SIZES
   * Standard heights and widths
   */
  sizes: {
    input: {
      height: 56,
      paddingHorizontal: 16,
    },
    button: {
      height: 56,
      paddingHorizontal: 24,
      paddingVertical: 18,
    },
    buttonSmall: {
      height: 44,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    icon: {
      small: 20,
      medium: 24,
      large: 32,
      xlarge: 40,
    },
  },

  /**
   * EMOJI SIZES
   * Consistent emoji display
   */
  emoji: {
    small: {
      fontSize: 24,
      lineHeight: 32,
    },
    medium: {
      fontSize: 32,
      lineHeight: 40,
    },
    large: {
      fontSize: 48,
      lineHeight: 56,
    },
    xlarge: {
      fontSize: 120,
      lineHeight: 128,
    },
  },
}

/**
 * GRADIENT CONFIGURATIONS
 * Pre-configured gradients for LinearGradient
 */
export const gradients = {
  primary: {
    colors: [
      designTokens.colors.gradientStart,
      designTokens.colors.gradientMiddle,
      designTokens.colors.gradientEnd,
    ],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  subtle: {
    colors: ["#F8F9FA", "#F3F4F6"],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
}

/**
 * COMMON STYLES
 * Reusable style objects
 */
export const commonStyles = {
  // Card with shadow
  card: {
    backgroundColor: designTokens.colors.backgroundWhite,
    borderRadius: designTokens.borderRadius.card,
    padding: designTokens.spacing.xl,
    ...designTokens.shadows.lg,
  },

  // Primary button
  buttonPrimary: {
    backgroundColor: designTokens.colors.primary,
    borderRadius: designTokens.borderRadius.lg,
    ...designTokens.sizes.button,
    ...designTokens.shadows.md,
  },

  // Secondary button
  buttonSecondary: {
    backgroundColor: designTokens.colors.secondary,
    borderRadius: designTokens.borderRadius.lg,
    ...designTokens.sizes.button,
  },

  // Input field
  input: {
    ...designTokens.sizes.input,
    backgroundColor: designTokens.colors.backgroundLight,
    borderWidth: 1,
    borderColor: designTokens.colors.border,
    borderRadius: designTokens.borderRadius.lg,
    ...designTokens.typography.bodyMD,
    color: designTokens.colors.textPrimary,
  },

  // Back button (frosted glass)
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: designTokens.colors.frosted,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  // Modal card (bottom sheet)
  modalCard: {
    backgroundColor: designTokens.colors.backgroundWhite,
    borderTopLeftRadius: designTokens.borderRadius.card,
    borderTopRightRadius: designTokens.borderRadius.card,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.xl,
    paddingBottom: 40,
    ...designTokens.shadows.bottom,
  },
}

export default designTokens
