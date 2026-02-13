export type { ServerStats } from '../types.js'

/**
 * Props for the {@link Sparkline} SVG chart component.
 *
 * Renders a small inline sparkline with a gradient fill area.
 * Shows a "collecting data..." placeholder when fewer than 2 data points
 * are available.
 */
export interface SparklineProps {
  /** Array of numeric values to plot. Rendered left-to-right in order. */
  data: number[]

  /**
   * Stroke and gradient fill color as a CSS hex value.
   * @default '#34d399' (emerald)
   */
  color?: string

  /**
   * SVG viewport width in pixels.
   * @default 120
   */
  width?: number

  /**
   * SVG viewport height in pixels.
   * @default 32
   */
  height?: number

  /**
   * Text to display when there are fewer than 2 data points.
   * @default 'collecting data...'
   */
  collectingLabel?: string
}

/**
 * Props for the {@link TooltipPopup} hover popup component.
 *
 * Displayed when hovering over a {@link StatBadge}. Shows the current
 * value, min/max/avg statistics, details text, and a sparkline chart.
 */
export interface TooltipPopupProps {
  /** Title text at the top of the tooltip (e.g. `"CPU Usage"`). */
  title: string

  /**
   * Unit label displayed next to the title and used for formatting
   * min/max/avg values (e.g. `"%"`, `"ms"`, `"MB"`, `"bytes"`, `"/s"`).
   */
  unit?: string

  /** Current metric value as a pre-formatted string. */
  currentValue: string

  /**
   * Rolling history of numeric values for the sparkline chart
   * and min/max/avg computation.
   */
  history?: number[]

  /**
   * Sparkline color as a CSS hex value.
   * @default '#34d399' (emerald)
   */
  historyColor?: string

  /** Additional detail text rendered below the stats. */
  details?: string

  /**
   * Maximum number of history samples to display.
   * @default 60
   */
  maxHistory?: number
}

/**
 * Props for the {@link StatBadge} metric display component.
 *
 * Renders a compact label + value pair. Hovering shows a
 * {@link TooltipPopup} with details and a sparkline chart.
 */
export interface StatBadgeProps {
  /** Short uppercase label (e.g. `"CPU"`, `"MEM"`, `"REQ/s"`). */
  label: string

  /** Pre-formatted metric value string (e.g. `"42.1%"`, `"128M"`). */
  value: string

  /**
   * Tailwind CSS color class for the value text.
   *
   * Use the provided color utility functions (`cpuColor`, `latencyColor`,
   * etc.) to compute threshold-based colors.
   *
   * @default 'text-emerald-400'
   */
  color?: string

  /** Title text shown in the tooltip popup. */
  tooltipTitle: string

  /** Unit label for the tooltip (e.g. `"%"`, `"ms"`). */
  tooltipUnit?: string

  /** Detail text shown in the tooltip. */
  tooltipDetails?: string

  /** Rolling numeric history for the tooltip sparkline. */
  history?: number[]

  /**
   * Sparkline color in the tooltip as a CSS hex value.
   * @default '#34d399' (emerald)
   */
  historyColor?: string

  /**
   * Optional URL. When set, the badge renders as an `<a>` link
   * instead of a `<div>`.
   */
  href?: string
}

/**
 * Options for the {@link useServerStats} React hook.
 *
 * All fields are optional -- sensible defaults are used when omitted.
 */
export interface UseServerStatsOptions {
  /**
   * HTTP endpoint to fetch the initial stats snapshot from.
   * @default '/admin/api/server-stats'
   */
  endpoint?: string

  /**
   * Transmit SSE channel to subscribe to for real-time updates.
   * @default 'admin/server-stats'
   */
  channel?: string

  /**
   * Maximum number of historical snapshots to retain for sparklines.
   *
   * Older entries are dropped when the limit is reached.
   * @default 60
   */
  maxHistory?: number

  /**
   * Milliseconds without an update before the connection is
   * considered stale (the `stale` flag becomes `true`).
   * @default 10_000
   */
  staleTimeout?: number
}
