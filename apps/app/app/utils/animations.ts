/**
 * Shared Animation Constants
 *
 * Centralized animation configuration for consistent animations across components.
 */

// =============================================================================
// SPRING CONFIGURATION
// =============================================================================

/**
 * Standard spring configuration for button and card press animations.
 * Provides snappy, responsive feel with:
 * - damping: 15 (controls bounce/oscillation)
 * - stiffness: 400 (controls speed)
 * - mass: 0.5 (controls weight/inertia)
 */
export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 400,
  mass: 0.5,
} as const

/**
 * Softer spring configuration for subtle animations.
 * Use for background color transitions or gentle movements.
 */
export const SPRING_CONFIG_SOFT = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
} as const

/**
 * Progress bar spring configuration.
 * Optimized for smooth value transitions.
 */
export const SPRING_CONFIG_PROGRESS = {
  damping: 20,
  stiffness: 90,
  mass: 0.5,
} as const


