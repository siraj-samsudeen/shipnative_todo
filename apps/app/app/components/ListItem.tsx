import { forwardRef, ReactElement } from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { haptics } from "@/utils/haptics"

import { Icon, IconTypes } from "./Icon"
import { Text, TextProps } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

export interface ListItemProps {
  /**
   * How tall the list item should be.
   * Default: 56
   */
  height?: number
  /**
   * Whether to show the top separator.
   * Default: false
   */
  topSeparator?: boolean
  /**
   * Whether to show the bottom separator.
   * Default: false
   */
  bottomSeparator?: boolean
  /**
   * Text to display if not using `tx` or nested components.
   */
  text?: TextProps["text"]
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps["tx"]
  /**
   * Children components.
   */
  children?: TextProps["children"]
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps["txOptions"]
  /**
   * Optional text style override.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * Pass any additional props directly to the Text component.
   */
  TextProps?: TextProps
  /**
   * Optional View container style override.
   */
  containerStyle?: StyleProp<ViewStyle>
  /**
   * Optional style override.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Icon that should appear on the left.
   */
  leftIcon?: IconTypes
  /**
   * An optional tint color for the left icon
   */
  leftIconColor?: string
  /**
   * Icon that should appear on the right.
   */
  rightIcon?: IconTypes
  /**
   * An optional tint color for the right icon
   */
  rightIconColor?: string
  /**
   * Right action custom ReactElement.
   * Overrides `rightIcon`.
   */
  RightComponent?: ReactElement
  /**
   * Left action custom ReactElement.
   * Overrides `leftIcon`.
   */
  LeftComponent?: ReactElement
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
   * Test ID
   */
  testID?: string
}

interface ListItemActionProps {
  icon?: IconTypes
  iconColor?: string
  Component?: ReactElement
  size: number
  side: "left" | "right"
}

// Spring config
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 200,
  mass: 0.5,
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * A styled row component that can be used in FlatList, SectionList, or by itself.
 * Includes haptic feedback and smooth press animations.
 *
 * @example
 * // Basic list item
 * <ListItem text="Settings" onPress={() => {}} />
 *
 * // With icons
 * <ListItem
 *   text="Profile"
 *   leftIcon="person"
 *   rightIcon="chevron-forward"
 *   onPress={() => {}}
 * />
 *
 * // With custom components
 * <ListItem
 *   text="Notifications"
 *   LeftComponent={<Badge dot variant="error" />}
 *   RightComponent={<Switch />}
 * />
 */
export const ListItem = forwardRef<View, ListItemProps>(function ListItem(
  props: ListItemProps,
  ref,
) {
  const {
    bottomSeparator,
    children,
    height = 56,
    LeftComponent,
    leftIcon,
    leftIconColor,
    RightComponent,
    rightIcon,
    rightIconColor,
    style,
    text,
    TextProps: textProps,
    topSeparator,
    tx,
    txOptions,
    textStyle: $textStyleOverride,
    containerStyle: $containerStyleOverride,
    onPress,
    onLongPress,
    haptic = true,
    testID,
  } = props

  // Animation values
  const scale = useSharedValue(1)
  const backgroundColor = useSharedValue(0)

  const isTouchable = !!onPress || !!onLongPress

  // Gesture handlers
  const tapGesture = Gesture.Tap()
    .enabled(!!onPress)
    .onBegin(() => {
      scale.value = withSpring(0.98, SPRING_CONFIG)
      backgroundColor.value = withSpring(1, SPRING_CONFIG)
    })
    .onFinalize(() => {
      scale.value = withSpring(1, SPRING_CONFIG)
      backgroundColor.value = withSpring(0, SPRING_CONFIG)
    })
    .onEnd(() => {
      if (haptic) {
        runOnJS(haptics.listItemPress)()
      }
      if (onPress) {
        runOnJS(onPress)()
      }
    })

  const longPressGesture = Gesture.LongPress()
    .enabled(!!onLongPress)
    .minDuration(500)
    .onStart(() => {
      scale.value = withSpring(0.96, SPRING_CONFIG)
      if (haptic) {
        runOnJS(haptics.longPress)()
      }
      if (onLongPress) {
        runOnJS(onLongPress)()
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, SPRING_CONFIG)
      backgroundColor.value = withSpring(0, SPRING_CONFIG)
    })

  const composedGesture = Gesture.Race(tapGesture, longPressGesture)

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const $containerStyles = [
    topSeparator && styles.separatorTop,
    bottomSeparator && styles.separatorBottom,
    $containerStyleOverride,
  ]

  const content = (
    <Animated.View style={[styles.touchable, { minHeight: height }, animatedStyle, style]}>
      <ListItemAction
        side="left"
        size={height}
        icon={leftIcon}
        iconColor={leftIconColor}
        Component={LeftComponent}
      />

      <Text
        {...textProps}
        tx={tx}
        text={text}
        txOptions={txOptions}
        style={[styles.text, $textStyleOverride, textProps?.style]}
      >
        {children}
      </Text>

      <ListItemAction
        side="right"
        size={height}
        icon={rightIcon}
        iconColor={rightIconColor}
        Component={RightComponent}
      />
    </Animated.View>
  )

  if (isTouchable) {
    return (
      <View ref={ref} style={$containerStyles} testID={testID}>
        <GestureDetector gesture={composedGesture}>{content}</GestureDetector>
      </View>
    )
  }

  return (
    <View ref={ref} style={$containerStyles} testID={testID}>
      {content}
    </View>
  )
})

// =============================================================================
// LIST ITEM ACTION
// =============================================================================

function ListItemAction(props: ListItemActionProps) {
  const { icon, Component, iconColor, size, side } = props
  const { theme } = useUnistyles()

  if (Component) return Component

  if (icon !== undefined) {
    return (
      <View
        style={[
          styles.iconContainer,
          side === "left" && styles.iconContainerLeft,
          side === "right" && styles.iconContainerRight,
          { height: size },
        ]}
      >
        <Icon size={24} icon={icon} color={iconColor || theme.colors.foreground} />
      </View>
    )
  }

  return null
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  separatorTop: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },
  separatorBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  text: {
    paddingVertical: theme.spacing.sm,
    flexGrow: 1,
    flexShrink: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 0,
  },
  iconContainerLeft: {
    marginRight: theme.spacing.md,
  },
  iconContainerRight: {
    marginLeft: theme.spacing.md,
  },
}))
