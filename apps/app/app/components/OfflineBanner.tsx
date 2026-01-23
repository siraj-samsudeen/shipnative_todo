import { FC } from "react"
import { View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Text } from "./Text"
import type { TxKeyPath } from "@/i18n"

// =============================================================================
// TYPES
// =============================================================================

export interface OfflineBannerProps {
  /**
   * Whether to show the banner
   */
  visible?: boolean
  
  /**
   * Custom text to display (optional)
   */
  text?: string
  
  /**
   * Translation key for the text (optional)
   */
  tx?: TxKeyPath
}

// =============================================================================
// COMPONENT
// =============================================================================

export const OfflineBanner: FC<OfflineBannerProps> = function OfflineBanner({
  visible = false,
  text,
  tx,
}) {
  if (!visible) return null

  return (
    <View style={styles.container}>
      <Text
        text={text}
        tx={text ? undefined : (tx || "todoScreen:offline")}
        style={styles.text}
        preset="formHelper"
      />
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colors.warningForeground,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
}))