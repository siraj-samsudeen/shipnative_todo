const palette = {
  // Modern neutral palette with better contrast
  neutral100: "#FFFFFF",
  neutral200: "#F8F9FA",
  neutral300: "#E9ECEF",
  neutral400: "#DEE2E6",
  neutral500: "#ADB5BD",
  neutral600: "#6C757D",
  neutral700: "#495057",
  neutral800: "#212529",
  neutral900: "#000000",

  // Calming blue/purple gradient palette (inspired by Luma)
  primary100: "#F0F9FF",
  primary200: "#E0F2FE",
  primary300: "#BAE6FD",
  primary400: "#38BDF8",
  primary500: "#0EA5E9",
  primary600: "#0284C7",

  // Soft purple accents
  secondary100: "#FAF5FF",
  secondary200: "#F3E8FF",
  secondary300: "#E9D5FF",
  secondary400: "#C084FC",
  secondary500: "#A855F7",

  // Warm accent for CTAs (coral/peach)
  accent100: "#FFF7ED",
  accent200: "#FFEDD5",
  accent300: "#FED7AA",
  accent400: "#FB923C",
  accent500: "#F97316",

  // Success green
  success100: "#F0FDF4",
  success500: "#22C55E",

  // Error red
  angry100: "#FEF2F2",
  angry500: "#EF4444",

  overlay20: "rgba(0, 0, 0, 0.1)",
  overlay50: "rgba(0, 0, 0, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const
