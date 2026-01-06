import { ViewStyle } from "react-native"

// =============================================================================
// SHARED CHART TYPES
// =============================================================================

export interface DataPoint {
  /**
   * The label for this data point (x-axis)
   */
  label: string
  /**
   * The value for this data point (y-axis)
   */
  value: number
  /**
   * Optional color override for this data point
   */
  color?: string
}

export interface ChartDataset {
  /**
   * Dataset identifier
   */
  id: string
  /**
   * Dataset label (for legend)
   */
  label: string
  /**
   * Data points in the dataset
   */
  data: number[]
  /**
   * Line/bar color
   */
  color: string
  /**
   * Fill color (for area charts)
   */
  fillColor?: string
}

export interface BaseChartProps {
  /**
   * Chart width (defaults to container width)
   */
  width?: number
  /**
   * Chart height
   */
  height?: number
  /**
   * Padding around the chart
   */
  padding?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  /**
   * Show grid lines
   */
  showGrid?: boolean
  /**
   * Show axis labels
   */
  showLabels?: boolean
  /**
   * Show legend
   */
  showLegend?: boolean
  /**
   * Show values on data points
   */
  showValues?: boolean
  /**
   * Animate chart on mount
   */
  animated?: boolean
  /**
   * Additional container style
   */
  style?: ViewStyle
  /**
   * Test ID
   */
  testID?: string
}

export interface LineChartProps extends BaseChartProps {
  /**
   * Data labels (x-axis)
   */
  labels: string[]
  /**
   * Datasets to display
   */
  datasets: ChartDataset[]
  /**
   * Line curve type
   */
  curveType?: "linear" | "smooth"
  /**
   * Show dots on data points
   */
  showDots?: boolean
  /**
   * Fill area under the line
   */
  fillArea?: boolean
  /**
   * Line stroke width
   */
  strokeWidth?: number
}

export interface BarChartProps extends BaseChartProps {
  /**
   * Data points for the chart
   */
  data: DataPoint[]
  /**
   * Bar orientation
   */
  orientation?: "vertical" | "horizontal"
  /**
   * Bar corner radius
   */
  barRadius?: number
  /**
   * Gap between bars (0-1)
   */
  barGap?: number
  /**
   * Default bar color
   */
  barColor?: string
}

export interface PieChartProps extends BaseChartProps {
  /**
   * Data points for the chart
   */
  data: DataPoint[]
  /**
   * Inner radius for donut chart (0-1, relative to outer radius)
   */
  innerRadius?: number
  /**
   * Start angle in degrees
   */
  startAngle?: number
  /**
   * Show percentage labels
   */
  showPercentage?: boolean
  /**
   * Color palette for slices
   */
  colors?: string[]
}
