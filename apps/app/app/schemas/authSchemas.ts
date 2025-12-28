import { z } from "zod"

const passwordSchema = z.string().superRefine((password, ctx) => {
  if (!password || password.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password is required",
    })
    return
  }

  if (password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must be at least 8 characters",
    })
    return
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
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Password must contain at least one ${missingRequirements.join(", ")}`,
    })
  }
})

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: passwordSchema,
})

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (!confirmPassword || confirmPassword.trim() === "") {
      return
    }

    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    }
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})
