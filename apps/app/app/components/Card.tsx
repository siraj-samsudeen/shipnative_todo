import { Fragment, ReactNode } from "react"
import { View, ViewStyle } from "react-native"
import { GestureDetector } from "react-native-gesture-handler"
import Animated from "react-native-reanimated"
import { StyleSheet } from "react-native-unistyles"

import { usePressableGesture } from "@/hooks/usePressableGesture"
import { SPRING_CONFIG_SOFT } from "@/utils/animations"

import { Text, TextProps } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

type Presets = "default" | "elevated" | "outlined"
type Alignments = "top" | "center" | "space-between" | "force-footer-bottom"

export interface CardProps {
  /**
   * Card content text
   */
  content?: string
  /**
   * i18n key for content
   */
  contentTx?: TextProps["tx"]
  /**
   * Content translation options
   */
  contentTxOptions?: TextProps["txOptions"]
  /**
   * Card heading text
   */
  heading?: string
  /**
   * i18n key for heading
   */
  headingTx?: TextProps["tx"]
  /**
   * Heading translation options
   */
  headingTxOptions?: TextProps["txOptions"]
  /**
   * Card footer text
   */
  footer?: string
  /**
   * i18n key for footer
   */
  footerTx?: TextProps["tx"]
  /**
   * Footer translation options
   */
  footerTxOptions?: TextProps["txOptions"]
  /**
   * Visual preset
   */
  preset?: Presets
  /**
   * Vertical alignment of content
   */
  verticalAlignment?: Alignments
  /**
   * Custom heading component
   */
  HeadingComponent?: ReactNode
  /**
   * Custom content component
   */
  ContentComponent?: ReactNode
  /**
   * Custom footer component
   */
  FooterComponent?: ReactNode
  /**
   * Left side component
   */
  LeftComponent?: ReactNode
  /**
   * Right side component
   */
  RightComponent?: ReactNode
  /**
   * Additional heading text props
   */
  HeadingTextProps?: TextProps
  /**
   * Additional content text props
   */
  ContentTextProps?: TextProps
  /**
   * Additional footer text props
   */
  FooterTextProps?: TextProps
  /**
   * Press handler
   */
  onPress?: () => void
  /**
   * Long press handler
   */
  onLongPress?: () => void
  /**
   * Enable haptic feedback (default: true)
   */
  haptic?: boolean
  /**
   * Additional style
   */
  style?: ViewStyle
  /**
   * Test ID
   */
  testID?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Cards are useful for displaying related information in a contained way.
 * Includes haptic feedback and smooth press animations.
 *
 * @example
 * // Basic card
 * <Card
 *   heading="Card Title"
 *   content="Card content goes here"
 *   footer="Footer text"
 * />
 *
 * // Pressable card
 * <Card
 *   heading="Pressable Card"
 *   content="Tap me!"
 *   onPress={() => console.log('pressed')}
 * />
 *
 * // Card with custom components
 * <Card
 *   heading="Custom"
 *   LeftComponent={<Avatar />}
 *   RightComponent={<Icon name="chevron-right" />}
 * />
 */
export function Card(props: CardProps) {
  const {
    content,
    contentTx,
    contentTxOptions,
    footer,
    footerTx,
    footerTxOptions,
    heading,
    headingTx,
    headingTxOptions,
    preset = "default",
    verticalAlignment = "top",
    ContentComponent,
    HeadingComponent,
    FooterComponent,
    LeftComponent,
    RightComponent,
    ContentTextProps,
    HeadingTextProps,
    FooterTextProps,
    onPress,
    onLongPress,
    haptic = true,
    style,
    testID,
  } = props

  const isPressable = !!onPress || !!onLongPress
  const isHeadingPresent = !!(HeadingComponent || heading || headingTx)
  const isContentPresent = !!(ContentComponent || content || contentTx)
  const isFooterPresent = !!(FooterComponent || footer || footerTx)

  // Apply variants - map "default" to undefined for Unistyles
  const presetForStyles = preset === "default" ? undefined : preset
  styles.useVariants({ preset: presetForStyles, verticalAlignment })

  // Use shared pressable gesture hook with softer spring config for cards
  const { gesture, animatedStyle } = usePressableGesture({
    onPress,
    onLongPress,
    haptic,
    hapticType: "cardPress",
    pressScale: 0.98,
    longPressScale: 0.96,
    springConfig: SPRING_CONFIG_SOFT,
  })

  const HeaderContentWrapper = verticalAlignment === "force-footer-bottom" ? View : Fragment

  const cardContent = (
    <>
      {LeftComponent}

      <View style={styles.contentWrapper}>
        <HeaderContentWrapper>
          {HeadingComponent ||
            (isHeadingPresent && (
              <Text
                weight="bold"
                text={heading}
                tx={headingTx}
                txOptions={headingTxOptions}
                style={[
                  styles.heading,
                  (isFooterPresent || isContentPresent) && styles.headingSpacing,
                ]}
                {...HeadingTextProps}
              />
            ))}

          {ContentComponent ||
            (isContentPresent && (
              <Text
                text={content}
                tx={contentTx}
                txOptions={contentTxOptions}
                color="secondary"
                style={[styles.content, isFooterPresent && styles.contentSpacing]}
                {...ContentTextProps}
              />
            ))}
        </HeaderContentWrapper>

        {FooterComponent ||
          (isFooterPresent && (
            <Text
              size="xs"
              text={footer}
              tx={footerTx}
              txOptions={footerTxOptions}
              color="tertiary"
              style={styles.footer}
              {...FooterTextProps}
            />
          ))}
      </View>

      {RightComponent}
    </>
  )

  if (isPressable) {
    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.container, animatedStyle, style]}
          testID={testID}
          accessibilityRole="button"
        >
          {cardContent}
        </Animated.View>
      </GestureDetector>
    )
  }

  return (
    <Animated.View style={[styles.container, style]} testID={testID}>
      {cardContent}
    </Animated.View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    padding: theme.spacing.md,
    minHeight: 96,
    variants: {
      preset: {
        default: {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        elevated: {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.xl,
          ...theme.shadows.lg,
        },
        outlined: {
          backgroundColor: theme.colors.transparent,
          borderRadius: theme.radius.xl,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
        },
      },
      verticalAlignment: {
        "top": {
          alignItems: "flex-start",
        },
        "center": {
          alignItems: "center",
        },
        "space-between": {},
        "force-footer-bottom": {},
      },
    },
  },
  contentWrapper: {
    flex: 1,
    alignSelf: "stretch",
    variants: {
      preset: {
        default: {},
        elevated: {},
        outlined: {},
      },
      verticalAlignment: {
        "top": {
          justifyContent: "flex-start",
        },
        "center": {
          justifyContent: "center",
        },
        "space-between": {
          justifyContent: "space-between",
        },
        "force-footer-bottom": {
          justifyContent: "space-between",
        },
      },
    },
  },
  heading: {},
  headingSpacing: {
    marginBottom: theme.spacing.xxs,
  },
  content: {},
  contentSpacing: {
    marginBottom: theme.spacing.xxs,
  },
  footer: {},
}))
