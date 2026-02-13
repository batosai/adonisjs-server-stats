import { useCallback, useEffect, useRef, useState } from 'react'

import type { ServerStats } from '../types.js'
import type { UseServerStatsOptions } from './types.js'

const DEFAULT_MAX_HISTORY = 60
const DEFAULT_STALE_TIMEOUT = 10_000
const DEFAULT_ENDPOINT = '/admin/api/server-stats'
const DEFAULT_CHANNEL = 'admin/server-stats'

/**
 * React hook for consuming server stats in custom UIs.
 *
 * Handles the full data lifecycle:
 * 1. Fetches the initial snapshot from the HTTP endpoint via axios
 * 2. Subscribes to the Transmit SSE channel for real-time updates
 * 3. Maintains a rolling history buffer for sparkline charts
 * 4. Detects stale connections (no update within `staleTimeout`)
 *
 * @returns An object with:
 * - `stats` -- latest {@link ServerStats} snapshot, or `null` before first fetch
 * - `stale` -- `true` if no update received within the stale timeout
 * - `history` -- rolling array of past snapshots (for sparklines)
 *
 * @example
 * ```tsx
 * import { useServerStats } from 'adonisjs-server-stats/react'
 *
 * function Dashboard() {
 *   const { stats, stale } = useServerStats()
 *   if (!stats) return <div>Loading...</div>
 *   return <div>CPU: {stats.cpuPercent.toFixed(1)}%</div>
 * }
 * ```
 */
export function useServerStats(opts?: UseServerStatsOptions) {
  const endpoint = opts?.endpoint ?? DEFAULT_ENDPOINT
  const channel = opts?.channel ?? DEFAULT_CHANNEL
  const maxHistory = opts?.maxHistory ?? DEFAULT_MAX_HISTORY
  const staleTimeout = opts?.staleTimeout ?? DEFAULT_STALE_TIMEOUT

  const [stats, setStats] = useState<ServerStats | null>(null)
  const [stale, setStale] = useState(false)
  const timestampRef = useRef<number>(0)
  const historyRef = useRef<ServerStats[]>([])

  const pushHistory = useCallback(
    (s: ServerStats) => {
      const h = historyRef.current
      h.push(s)
      if (h.length > maxHistory) h.shift()
    },
    [maxHistory]
  )

  // Fetch initial stats via HTTP
  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      try {
        const { default: axios } = await import('axios')
        const { data } = await axios.get<ServerStats>(endpoint)
        if (!cancelled) {
          setStats(data)
          timestampRef.current = data.timestamp
          pushHistory(data)
        }
      } catch {
        // Silently ignore fetch errors
      }
    }

    fetchStats()
    return () => {
      cancelled = true
    }
  }, [endpoint, pushHistory])

  // Subscribe to SSE channel via Transmit
  useEffect(() => {
    let subscription: any = null
    let cleanup: (() => void) | null = null

    async function subscribe() {
      try {
        const { Transmit } = await import('@adonisjs/transmit-client')
        const transmit = new Transmit({ baseUrl: window.location.origin })
        subscription = transmit.subscription(channel)

        subscription.onMessage((message: ServerStats) => {
          setStats(message)
          timestampRef.current = message.timestamp
          setStale(false)
          pushHistory(message)
        })

        await subscription.create()
      } catch {
        // Transmit not available — fall back to no SSE
      }

      cleanup = () => {
        subscription?.delete()
      }
    }

    subscribe()
    return () => {
      cleanup?.()
    }
  }, [channel, pushHistory])

  // Stale detection
  useEffect(() => {
    if (!stats) return
    setStale(false)
    const timer = setTimeout(() => setStale(true), staleTimeout)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestampRef.current, staleTimeout])

  return {
    stats,
    stale,
    history: historyRef.current,
  }
}
