/**
 * EditProfileModal - Convex Version
 *
 * A modal for editing user profile with Convex.
 * Uses Convex mutations - changes sync in real-time across all devices!
 */

import type { FC } from "react"
import { useState, useEffect } from "react"
import { Modal, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { haptics } from "@/utils/haptics"
import { logger } from "@/utils/Logger"

import { Button } from "./Button"
import { Text } from "./Text"
import { TextField } from "./TextField"

// =============================================================================
// TYPES
// =============================================================================

interface ConvexUser {
  _id: string
  name?: string
  bio?: string
  avatarUrl?: string
  email?: string
}

export interface EditProfileModalConvexProps {
  visible: boolean
  onClose: () => void
  user: ConvexUser | null | undefined
  onUpdate: (name: string, bio?: string) => Promise<{ error: Error | null }>
}

// =============================================================================
// COMPONENT
// =============================================================================

export const EditProfileModalConvex: FC<EditProfileModalConvexProps> = ({
  visible,
  onClose,
  user,
  onUpdate,
}) => {
  const { theme } = useUnistyles()
  const { t } = useTranslation()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")

  // Initialize form with user data (reactive - updates when user changes!)
  useEffect(() => {
    if (user) {
      setName(user.name ?? "")
      setBio(user.bio ?? "")
    }
  }, [user])

  const handleSave = async () => {
    setError("")
    setIsUpdating(true)
    haptics.buttonPress()

    const { error: updateError } = await onUpdate(name, bio || undefined)

    setIsUpdating(false)

    if (updateError) {
      logger.error("Profile update error", { error: updateError })
      setError(updateError.message || t("editProfileModal:errorGeneric"))
      haptics.error()
      return
    }

    // Success! The UI will auto-update because Convex queries are reactive
    haptics.success()
    onClose()
  }

  const handleClose = () => {
    haptics.buttonPress()
    setError("")
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title} tx="editProfileModal:title" />
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </Pressable>
            </View>

            {/* Form */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TextField
                label="Display Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isUpdating}
              />

              <TextField
                label="Bio"
                placeholder="Tell us about yourself (optional)"
                value={bio}
                onChangeText={setBio}
                autoCapitalize="sentences"
                autoCorrect
                editable={!isUpdating}
                multiline
                numberOfLines={3}
                containerStyle={styles.bioField}
              />

              {/* Info about real-time sync */}
              <View style={styles.syncInfo}>
                <Ionicons name="sync" size={16} color={theme.colors.primary} />
                <Text preset="caption" style={styles.syncText}>
                  Changes sync instantly across all your devices
                </Text>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                tx="editProfileModal:cancelButton"
                variant="outlined"
                onPress={handleClose}
                disabled={isUpdating}
                style={styles.cancelButton}
              />
              <Button
                tx="editProfileModal:saveButton"
                variant="filled"
                onPress={handleSave}
                loading={isUpdating}
                disabled={isUpdating || !name.trim()}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
  },
  modal: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius["3xl"],
    overflow: "hidden",
    ...theme.shadows.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  title: {
    fontSize: theme.typography.sizes["2xl"],
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.foreground,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollView: {
    maxHeight: 400,
  },
  form: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  bioField: {
    marginTop: theme.spacing.sm,
  },
  syncInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.infoBackground,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
  },
  syncText: {
    flex: 1,
    color: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    marginTop: theme.spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
}))
