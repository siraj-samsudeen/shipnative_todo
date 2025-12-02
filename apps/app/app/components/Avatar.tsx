import { useMemo } from "react"
import { Image, ImageProps, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Text } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

type Sizes = "xs" | "sm" | "md" | "lg" | "xl"
type Shapes = "circle" | "rounded" | "square"

export interface AvatarProps {
  /**
   * Image source (uri or require)
   */
  source?: ImageProps["source"]
  /**
   * Fallback text (initials) when no image
   */
  fallback?: string
  /**
   * Avatar size
   */
  size?: Sizes
  /**
   * Avatar shape
   */
  shape?: Shapes
  /**
   * Alt text for accessibility
   */
  alt?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Avatar component for displaying user profile images or initials.
 *
 * @example
 * // With image
 * <Avatar source={{ uri: "https://..." }} size="lg" />
 *
 * // With fallback initials
 * <Avatar fallback="JD" />
 *
 * // Different shapes
 * <Avatar fallback="AB" shape="rounded" />
 * <Avatar fallback="CD" shape="square" />
 */
export function Avatar(props: AvatarProps) {
  const { source, fallback, size = "md", shape = "circle", alt } = props

  // Apply variants
  styles.useVariants({ size, shape })

  const initials = useMemo(() => {
    if (!fallback) return ""
    return fallback
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [fallback])

  const hasImage =
    source &&
    (typeof source === "number" ||
      (typeof source === "object" && !Array.isArray(source) && source.uri))

  if (hasImage) {
    return <Image source={source} style={styles.image} accessibilityLabel={alt || "Avatar"} />
  }

  return (
    <View style={styles.fallback} accessibilityLabel={alt || fallback || "Avatar"}>
      <Text style={styles.initials}>{initials}</Text>
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  image: {
    variants: {
      size: {
        xs: {
          width: theme.sizes.avatar.xs,
          height: theme.sizes.avatar.xs,
        },
        sm: {
          width: theme.sizes.avatar.sm,
          height: theme.sizes.avatar.sm,
        },
        md: {
          width: theme.sizes.avatar.md,
          height: theme.sizes.avatar.md,
        },
        lg: {
          width: theme.sizes.avatar.lg,
          height: theme.sizes.avatar.lg,
        },
        xl: {
          width: theme.sizes.avatar.xl,
          height: theme.sizes.avatar.xl,
        },
      },
      shape: {
        circle: {
          borderRadius: theme.radius.full,
        },
        rounded: {
          borderRadius: theme.radius.lg,
        },
        square: {
          borderRadius: theme.radius.sm,
        },
      },
    },
  },
  fallback: {
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      size: {
        xs: {
          width: theme.sizes.avatar.xs,
          height: theme.sizes.avatar.xs,
        },
        sm: {
          width: theme.sizes.avatar.sm,
          height: theme.sizes.avatar.sm,
        },
        md: {
          width: theme.sizes.avatar.md,
          height: theme.sizes.avatar.md,
        },
        lg: {
          width: theme.sizes.avatar.lg,
          height: theme.sizes.avatar.lg,
        },
        xl: {
          width: theme.sizes.avatar.xl,
          height: theme.sizes.avatar.xl,
        },
      },
      shape: {
        circle: {
          borderRadius: theme.radius.full,
        },
        rounded: {
          borderRadius: theme.radius.lg,
        },
        square: {
          borderRadius: theme.radius.sm,
        },
      },
    },
  },
  initials: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.fonts.semiBold,
    variants: {
      size: {
        xs: {
          fontSize: 10,
          lineHeight: 10,
        },
        sm: {
          fontSize: 12,
          lineHeight: 12,
        },
        md: {
          fontSize: 14,
          lineHeight: 14,
        },
        lg: {
          fontSize: 20,
          lineHeight: 20,
        },
        xl: {
          fontSize: 28,
          lineHeight: 28,
        },
      },
      shape: {
        circle: {},
        rounded: {},
        square: {},
      },
    },
  },
}))
