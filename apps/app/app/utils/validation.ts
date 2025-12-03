/**
 * Validation utilities for forms
 * Provides reusable validation functions for email, password, and other inputs
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface PasswordStrength {
  score: number // 0-3 (weak, fair, good, strong)
  label: "weak" | "fair" | "good" | "strong"
  feedback: string[]
}

/**
 * Validates email format using a comprehensive regex pattern
 * Based on RFC 5322 standards
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === "") {
    return {
      isValid: false,
      error: "Email is required",
    }
  }

  // RFC 5322 compliant email regex (simplified for practical use)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    }
  }

  return { isValid: true }
}

/**
 * Validates password meets security requirements
 * Requirements:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === "") {
    return {
      isValid: false,
      error: "Password is required",
    }
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters",
    }
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  const missingRequirements: string[] = []
  if (!hasUppercase) missingRequirements.push("uppercase letter")
  if (!hasLowercase) missingRequirements.push("lowercase letter")
  if (!hasNumber) missingRequirements.push("number")
  if (!hasSpecialChar) missingRequirements.push("special character")

  if (missingRequirements.length > 0) {
    return {
      isValid: false,
      error: `Password must contain at least one ${missingRequirements.join(", ")}`,
    }
  }

  return { isValid: true }
}

/**
 * Checks if password confirmation matches
 */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): ValidationResult {
  if (!confirmation || confirmation.trim() === "") {
    return {
      isValid: false,
      error: "Please confirm your password",
    }
  }

  if (password !== confirmation) {
    return {
      isValid: false,
      error: "Passwords do not match",
    }
  }

  return { isValid: true }
}

/**
 * Calculates password strength and provides feedback
 */
export function analyzePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: "weak",
      feedback: ["Password is required"],
    }
  }

  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) {
    score++
  } else {
    feedback.push("Use at least 8 characters")
  }

  // Has lowercase and uppercase
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push("Use both uppercase and lowercase letters")
  }

  // Has numbers
  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push("Include at least one number")
  }

  // Has special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++
  } else {
    feedback.push("Include special characters (!@#$, etc.)")
  }

  // Map score to label
  let label: "weak" | "fair" | "good" | "strong"
  if (score === 0 || score === 1) {
    label = "weak"
  } else if (score === 2) {
    label = "fair"
  } else if (score === 3) {
    label = "good"
  } else {
    label = "strong"
  }

  return {
    score,
    label,
    feedback: feedback.length > 0 ? feedback : ["Strong password!"],
  }
}

/**
 * Validates all login form fields
 */
export function validateLoginForm(
  email: string,
  password: string,
): {
  isValid: boolean
  errors: {
    email?: string
    password?: string
  }
} {
  const errors: { email?: string; password?: string } = {}

  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validates all registration form fields
 */
export function validateRegisterForm(
  email: string,
  password: string,
  confirmPassword: string,
): {
  isValid: boolean
  errors: {
    email?: string
    password?: string
    confirmPassword?: string
  }
} {
  const errors: { email?: string; password?: string; confirmPassword?: string } = {}

  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error
  }

  const confirmValidation = validatePasswordConfirmation(password, confirmPassword)
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
