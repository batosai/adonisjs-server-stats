import { LogStreamService } from '../log_stream/log_stream_service.js'

import type { MetricCollector } from './collector.js'

/**
 * Options for {@link logCollector}.
 */
export interface LogCollectorOptions {
  /**
   * Path to the JSON log file to monitor.
   *
   * Relative to the application root. The file must contain
   * newline-delimited JSON entries (one per line) with `level`
   * and `time` fields (Pino format).
   *
   * @example `'logs/adonisjs.log'`
   */
  logPath: string
}

let sharedLogStream: LogStreamService | null = null

/**
 * Returns the shared {@link LogStreamService} instance created by
 * `logCollector()`, or `null` if the log collector is not configured.
 *
 * Useful for accessing the log stream outside of the collector
 * (e.g. in the LogStreamProvider for live broadcasting).
 */
export function getLogStreamService(): LogStreamService | null {
  return sharedLogStream
}

/**
 * Monitors a JSON log file and reports rolling error/warning counts.
 *
 * Uses {@link LogStreamService} internally to poll the log file every
 * 2 seconds and maintain a 5-minute sliding window of entries.
 *
 * **Metrics produced:**
 * - `logErrorsLast5m` -- error + fatal entries in the last 5 minutes
 * - `logWarningsLast5m` -- warning entries in the last 5 minutes
 * - `logEntriesLast5m` -- total entries in the last 5 minutes
 * - `logEntriesPerMinute` -- entries per minute (averaged over 5 min)
 *
 * **Peer dependencies:** none
 *
 * @example
 * ```ts
 * import { logCollector } from 'adonisjs-server-stats/collectors'
 *
 * logCollector({ logPath: 'logs/adonisjs.log' })
 * ```
 */
export function logCollector(opts: LogCollectorOptions): MetricCollector {
  const service = new LogStreamService(opts.logPath)
  sharedLogStream = service

  return {
    name: 'log',

    async start() {
      await service.start()
    },

    stop() {
      service.stop()
    },

    collect() {
      const stats = service.getLogStats()
      return {
        logErrorsLast5m: stats.errorsLast5m,
        logWarningsLast5m: stats.warningsLast5m,
        logEntriesLast5m: stats.entriesLast5m,
        logEntriesPerMinute: stats.entriesPerMinute,
      }
    },
  }
}
