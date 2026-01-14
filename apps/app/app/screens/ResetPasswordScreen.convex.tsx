/**
 * ResetPasswordScreen - Convex Version
 *
 * Handles password reset flow with Convex Auth:
 * - Verifies reset code from email (8-digit OTP)
 * - Uses Convex Auth's password reset flow
 * - Updates password directly through Convex Auth
 *
 * Flow:
 * 1. User requests reset via ForgotPasswordScreen (sends OTP email)
 * 2. User enters the 8-digit code from email
 * 3. User enters new password
 * 4. Password is updated via Convex Auth
 *
 * KEY DIFFERENCE FROM SUPABASE:
 * - Uses OTP code verification instead of URL tokens
 * - Simpler flow - code + new password in one step
 * - No session exchange needed
 */

import { useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { StyleSheet } from "react-native-unistyles"
import { z } from "zod"
import { useAuthActions } from "@convex-dev/auth/react"

import { AuthScreenLayout } from "@/components/layouts/AuthScreenLayout"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { AppStackParamList, AppStackScreenProps } from "@/navigators/navigationTypes"
import { formatAuthError } from "@/utils/formatAuthError"

// Schema for the Convex password reset form (includes code)
const convexResetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(8, "Code must be 8 characters")
      .max(8, "Code must be 8 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ConvexResetPasswordFormData = z.infer<typeof convexResetPasswordSchema>

export const ResetPasswordScreen = () => {
  const navigation = useNavigation<AppStackScreenProps<"ResetPassword">["navigation"]>()
  const route = useRoute<RouteProp<AppStackParamList, "ResetPassword">>()
  const { t } = useTranslation()
  const { signIn } = useAuthActions()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Get email from route params (passed from ForgotPasswordScreen)
  const email = route.params?.email

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ConvexResetPasswordFormData>({
    resolver: zodResolver(convexResetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  })

  // ============================================================
  // CONVEX PASSWORD RESET
  // Uses Convex Auth's password provider with reset flow
  // ============================================================
  const onSubmit = async (data: ConvexResetPasswordFormData) => {
    if (!email) {
      setError("Email address is missing. Please restart the password reset flow.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convex Auth password reset: verify code and set new password
      await signIn("password", {
        email,
        code: data.code,
        newPassword: data.password,
        flow: "reset-verification",
      })

      setSuccess(true)
    } catch (err) {
      const resolvedError = err instanceof Error ? err : new Error(String(err))
      setError(formatAuthError(resolvedError))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = handleSubmit(onSubmit)

  const handleBackToLogin = () => {
    navigation.navigate("Login" as never)
  }

  const handleResendCode = () => {
    // Navigate back to forgot password to resend
    navigation.navigate("ForgotPassword" as never)
  }

  // Success state
  if (success) {
    return (
      <AuthScreenLayout
        headerIcon="✅"
        title={t("resetPasswordScreen:successTitle")}
        subtitle={t("resetPasswordScreen:successSubtitle")}
        scrollable
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleBackToLogin}
          activeOpacity={0.8}
        >
          <Text
            weight="semiBold"
            style={styles.primaryButtonText}
            tx="resetPasswordScreen:backToLogin"
          />
        </TouchableOpacity>
      </AuthScreenLayout>
    )
  }

  // No email - error state
  if (!email) {
    return (
      <AuthScreenLayout
        headerIcon="❌"
        title="Missing Information"
        subtitle="Please start the password reset process from the forgot password screen."
        showBackButton
        onBack={() => navigation.goBack()}
        scrollable
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("ForgotPassword" as never)}
          activeOpacity={0.8}
        >
          <Text weight="semiBold" style={styles.primaryButtonText}>
            Go to Forgot Password
          </Text>
        </TouchableOpacity>
      </AuthScreenLayout>
    )
  }

  // Password reset form
  return (
    <AuthScreenLayout
      headerIcon="🔐"
      title={t("resetPasswordScreen:title")}
      subtitle={`Enter the 8-digit code sent to ${email} and your new password`}
      showBackButton
      onBack={() => navigation.goBack()}
      scrollable
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text size="sm" color="error" style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

      {/* Verification Code Input */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="code"
          render={({ field, fieldState }) => (
            <TextField
              label="Verification Code"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Enter 8-digit code"
              autoCapitalize="none"
              autoComplete="one-time-code"
              keyboardType="number-pad"
              maxLength={8}
              returnKeyType="next"
              status={fieldState.error ? "error" : "default"}
              helper={fieldState.error?.message}
            />
          )}
        />
      </View>

      {/* New Password Input */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              labelTx="resetPasswordScreen:passwordLabel"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholderTx="resetPasswordScreen:passwordPlaceholder"
              autoCapitalize="none"
              autoComplete="password-new"
              secureTextEntry
              returnKeyType="next"
              status={fieldState.error ? "error" : "default"}
              helper={fieldState.error?.message}
            />
          )}
        />
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <TextField
              labelTx="resetPasswordScreen:confirmLabel"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholderTx="resetPasswordScreen:confirmPlaceholder"
              autoCapitalize="none"
              autoComplete="password-new"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleResetPassword}
              status={fieldState.error ? "error" : "default"}
              helper={fieldState.error?.message}
            />
          )}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.primaryButton, (!isValid || loading) && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={!isValid || loading}
        activeOpacity={0.8}
      >
        <Text weight="semiBold" style={styles.primaryButtonText}>
          {loading ? "Resetting..." : t("resetPasswordScreen:submit")}
        </Text>
      </TouchableOpacity>

      {/* Resend Code Link */}
      <TouchableOpacity onPress={handleResendCode} style={styles.linkButton} activeOpacity={0.6}>
        <Text color="secondary">
          Didn't receive the code?{" "}
          <Text weight="semiBold" color="primary">
            Resend
          </Text>
        </Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: theme.colors.errorBackground,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  errorText: {
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.md,
  },
  primaryButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.sizes.lg,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
}))
