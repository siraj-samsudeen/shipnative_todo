import { useCallback, useMemo, useState } from "react"
import { View, ViewStyle, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
} from "date-fns"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { SPRING_CONFIG } from "@/utils/animations"

import { Button } from "./Button"
import { Modal } from "./Modal"
import { Text, TextProps } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

type DatePickerMode = "date" | "time" | "datetime"

export interface DatePickerProps {
  /**
   * Currently selected date
   */
  value?: Date
  /**
   * Callback when date changes
   */
  onChange?: (date: Date) => void
  /**
   * Picker mode: date, time, or both
   */
  mode?: DatePickerMode
  /**
   * Minimum selectable date
   */
  minDate?: Date
  /**
   * Maximum selectable date
   */
  maxDate?: Date
  /**
   * Label text
   */
  label?: string
  /**
   * Label translation key
   */
  labelTx?: TextProps["tx"]
  /**
   * Placeholder text
   */
  placeholder?: string
  /**
   * Placeholder translation key
   */
  placeholderTx?: TextProps["tx"]
  /**
   * Error message
   */
  error?: string
  /**
   * Error translation key
   */
  errorTx?: TextProps["tx"]
  /**
   * Helper text
   */
  helper?: string
  /**
   * Helper translation key
   */
  helperTx?: TextProps["tx"]
  /**
   * Disabled state
   */
  disabled?: boolean
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
// CONSTANTS
// =============================================================================

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * A customizable date and time picker component with calendar view.
 *
 * @example
 * // Basic date picker
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   label="Select Date"
 * />
 *
 * // Time picker
 * <DatePicker
 *   value={selectedTime}
 *   onChange={setSelectedTime}
 *   mode="time"
 *   label="Select Time"
 * />
 *
 * // Date and time picker
 * <DatePicker
 *   value={selectedDateTime}
 *   onChange={setSelectedDateTime}
 *   mode="datetime"
 *   label="Select Date & Time"
 * />
 *
 * // With min/max dates
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   minDate={new Date()}
 *   maxDate={addMonths(new Date(), 3)}
 * />
 */
export function DatePicker(props: DatePickerProps) {
  const {
    value,
    onChange,
    mode = "date",
    minDate,
    maxDate,
    label,
    labelTx,
    placeholder = "Select date",
    placeholderTx,
    error,
    errorTx,
    helper,
    helperTx,
    disabled = false,
    style,
    testID,
  } = props

  const { theme } = useUnistyles()
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value || new Date())
  const [tempDate, setTempDate] = useState(value || new Date())
  const [activeTab, setActiveTab] = useState<"date" | "time">("date")

  const scale = useSharedValue(1)

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(0.98, SPRING_CONFIG)
    }
  }, [disabled, scale])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG)
  }, [scale])

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setTempDate(value || new Date())
      setCurrentMonth(value || new Date())
      setActiveTab(mode === "time" ? "time" : "date")
      setIsOpen(true)
    }
  }, [disabled, value, mode])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleConfirm = useCallback(() => {
    onChange?.(tempDate)
    setIsOpen(false)
  }, [onChange, tempDate])

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }, [])

  const handleSelectDate = useCallback(
    (date: Date) => {
      // Preserve time from tempDate when selecting a new date
      const newDate = new Date(date)
      newDate.setHours(getHours(tempDate))
      newDate.setMinutes(getMinutes(tempDate))
      setTempDate(newDate)
    },
    [tempDate],
  )

  const handleSelectHour = useCallback((hour: number) => {
    setTempDate((prev) => setHours(prev, hour))
  }, [])

  const handleSelectMinute = useCallback((minute: number) => {
    setTempDate((prev) => setMinutes(prev, minute))
  }, [])

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (minDate && date < startOfMonth(minDate) && !isSameMonth(date, minDate)) {
        return true
      }
      if (minDate && isSameMonth(date, minDate) && date < minDate) {
        return true
      }
      if (maxDate && date > endOfMonth(maxDate) && !isSameMonth(date, maxDate)) {
        return true
      }
      if (maxDate && isSameMonth(date, maxDate) && date > maxDate) {
        return true
      }
      return false
    },
    [minDate, maxDate],
  )

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  // Format display value
  const displayValue = useMemo(() => {
    if (!value) return null

    switch (mode) {
      case "date":
        return format(value, "MMM d, yyyy")
      case "time":
        return format(value, "h:mm a")
      case "datetime":
        return format(value, "MMM d, yyyy 'at' h:mm a")
      default:
        return format(value, "MMM d, yyyy")
    }
  }, [value, mode])

  const hasError = !!error || !!errorTx

  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      {/* Label */}
      {(label || labelTx) && (
        <Text text={label} tx={labelTx} weight="medium" size="sm" style={styles.label} />
      )}

      {/* Input Button */}
      <Pressable
        onPress={handleOpen}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || "Date picker"}
        accessibilityState={{ disabled }}
      >
        <Animated.View
          style={[
            styles.input,
            hasError && styles.inputError,
            disabled && styles.inputDisabled,
            animatedInputStyle,
          ]}
        >
          <Ionicons
            name={mode === "time" ? "time-outline" : "calendar-outline"}
            size={20}
            color={disabled ? theme.colors.foregroundTertiary : theme.colors.foregroundSecondary}
          />
          {displayValue ? (
            <Text style={styles.value}>{displayValue}</Text>
          ) : (
            <Text text={placeholder} tx={placeholderTx} style={styles.placeholder} />
          )}
          <Ionicons name="chevron-down" size={20} color={theme.colors.foregroundTertiary} />
        </Animated.View>
      </Pressable>

      {/* Helper/Error Text */}
      {(helper || helperTx || error || errorTx) && (
        <Text
          text={error || helper}
          tx={errorTx || helperTx}
          size="xs"
          style={[styles.helper, hasError && styles.helperError]}
        />
      )}

      {/* Picker Modal */}
      <Modal
        visible={isOpen}
        onClose={handleClose}
        title={
          mode === "time"
            ? "Select Time"
            : mode === "datetime"
              ? "Select Date & Time"
              : "Select Date"
        }
      >
        <View style={styles.modalContent}>
          {/* Tab Switcher for datetime mode */}
          {mode === "datetime" && (
            <View style={styles.tabContainer}>
              <Pressable
                onPress={() => setActiveTab("date")}
                style={[styles.tab, activeTab === "date" && styles.tabActive]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={
                    activeTab === "date" ? theme.colors.primary : theme.colors.foregroundSecondary
                  }
                />
                <Text
                  text="Date"
                  weight={activeTab === "date" ? "semiBold" : "regular"}
                  style={[styles.tabText, activeTab === "date" && styles.tabTextActive]}
                />
              </Pressable>
              <Pressable
                onPress={() => setActiveTab("time")}
                style={[styles.tab, activeTab === "time" && styles.tabActive]}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={
                    activeTab === "time" ? theme.colors.primary : theme.colors.foregroundSecondary
                  }
                />
                <Text
                  text="Time"
                  weight={activeTab === "time" ? "semiBold" : "regular"}
                  style={[styles.tabText, activeTab === "time" && styles.tabTextActive]}
                />
              </Pressable>
            </View>
          )}

          {/* Date Picker */}
          {(mode === "date" || (mode === "datetime" && activeTab === "date")) && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <Pressable onPress={handlePrevMonth} style={styles.navButton}>
                  <Ionicons name="chevron-back" size={24} color={theme.colors.foreground} />
                </Pressable>
                <Text weight="semiBold" size="lg">
                  {format(currentMonth, "MMMM yyyy")}
                </Text>
                <Pressable onPress={handleNextMonth} style={styles.navButton}>
                  <Ionicons name="chevron-forward" size={24} color={theme.colors.foreground} />
                </Pressable>
              </View>

              {/* Weekday Headers */}
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((day) => (
                  <View key={day} style={styles.weekdayCell}>
                    <Text text={day} size="xs" weight="medium" style={styles.weekdayText} />
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = tempDate && isSameDay(day, tempDate)
                  const isTodayDate = isToday(day)
                  const isDisabled = isDateDisabled(day) || !isCurrentMonth

                  return (
                    <Pressable
                      key={index}
                      onPress={() => !isDisabled && handleSelectDate(day)}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isTodayDate && !isSelected && styles.dayCellToday,
                        isDisabled && styles.dayCellDisabled,
                      ]}
                      disabled={isDisabled}
                    >
                      <Text
                        text={format(day, "d")}
                        weight={isSelected ? "semiBold" : "regular"}
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          !isCurrentMonth && styles.dayTextOtherMonth,
                          isDisabled && styles.dayTextDisabled,
                          isTodayDate && !isSelected && styles.dayTextToday,
                        ]}
                      />
                    </Pressable>
                  )
                })}
              </View>
            </Animated.View>
          )}

          {/* Time Picker */}
          {(mode === "time" || (mode === "datetime" && activeTab === "time")) && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
              <View style={styles.timeContainer}>
                {/* Hour Picker */}
                <View style={styles.timeColumn}>
                  <Text text="Hour" weight="medium" size="sm" style={styles.timeLabel} />
                  <View style={styles.timeScrollContainer}>
                    {HOURS.map((hour) => {
                      const isSelected = getHours(tempDate) === hour
                      return (
                        <Pressable
                          key={hour}
                          onPress={() => handleSelectHour(hour)}
                          style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                        >
                          <Text
                            text={hour.toString().padStart(2, "0")}
                            weight={isSelected ? "semiBold" : "regular"}
                            style={[
                              styles.timeOptionText,
                              isSelected && styles.timeOptionTextSelected,
                            ]}
                          />
                        </Pressable>
                      )
                    })}
                  </View>
                </View>

                {/* Separator */}
                <Text text=":" weight="bold" size="xl" style={styles.timeSeparator} />

                {/* Minute Picker */}
                <View style={styles.timeColumn}>
                  <Text text="Min" weight="medium" size="sm" style={styles.timeLabel} />
                  <View style={styles.timeScrollContainer}>
                    {MINUTES.map((minute) => {
                      const isSelected = getMinutes(tempDate) === minute
                      return (
                        <Pressable
                          key={minute}
                          onPress={() => handleSelectMinute(minute)}
                          style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                        >
                          <Text
                            text={minute.toString().padStart(2, "0")}
                            weight={isSelected ? "semiBold" : "regular"}
                            style={[
                              styles.timeOptionText,
                              isSelected && styles.timeOptionTextSelected,
                            ]}
                          />
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              </View>

              {/* Selected Time Display */}
              <View style={styles.selectedTimeDisplay}>
                <Text weight="semiBold" size="xl">
                  {format(tempDate, "h:mm a")}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              text="Cancel"
              variant="ghost"
              onPress={handleClose}
              style={styles.actionButton}
            />
            <Button text="Confirm" onPress={handleConfirm} style={styles.actionButton} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: "100%",
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.foreground,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    height: theme.sizes.input.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  value: {
    flex: 1,
    color: theme.colors.foreground,
  },
  placeholder: {
    flex: 1,
    color: theme.colors.inputPlaceholder,
  },
  helper: {
    marginTop: theme.spacing.xs,
    color: theme.colors.foregroundSecondary,
  },
  helperError: {
    color: theme.colors.error,
  },
  modalContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxs,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
  },
  tabActive: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  tabText: {
    color: theme.colors.foregroundSecondary,
  },
  tabTextActive: {
    color: theme.colors.foreground,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  navButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  weekdayText: {
    color: theme.colors.foregroundSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
  },
  dayCellSelected: {
    backgroundColor: theme.colors.primary,
  },
  dayCellToday: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    color: theme.colors.foreground,
  },
  dayTextSelected: {
    color: theme.colors.primaryForeground,
  },
  dayTextOtherMonth: {
    color: theme.colors.foregroundTertiary,
  },
  dayTextDisabled: {
    color: theme.colors.foregroundTertiary,
  },
  dayTextToday: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.semiBold,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  timeColumn: {
    alignItems: "center",
    width: 80,
  },
  timeLabel: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.foregroundSecondary,
  },
  timeScrollContainer: {
    maxHeight: 200,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  timeOption: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  timeOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  timeOptionText: {
    color: theme.colors.foreground,
  },
  timeOptionTextSelected: {
    color: theme.colors.primaryForeground,
  },
  timeSeparator: {
    marginTop: theme.spacing.xl,
    color: theme.colors.foreground,
  },
  selectedTimeDisplay: {
    alignItems: "center",
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.lg,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
}))
