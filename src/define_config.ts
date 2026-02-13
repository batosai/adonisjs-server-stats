import type { ServerStatsConfig } from './types.js'

/**
 * Define the server stats configuration with full type safety.
 *
 * This is the main entry point for configuring `adonisjs-server-stats`.
 * Call it in `config/server_stats.ts` and export the result as default.
 *
 * @example
 * ```ts
 * // config/server_stats.ts
 * import { defineConfig } from 'adonisjs-server-stats'
 * import { processCollector, httpCollector } from 'adonisjs-server-stats/collectors'
 *
 * export default defineConfig({
 *   intervalMs: 3000,
 *   transport: 'transmit',
 *   channelName: 'admin/server-stats',
 *   endpoint: '/admin/api/server-stats',
 *   collectors: [processCollector(), httpCollector()],
 * })
 * ```
 */
export function defineConfig(config: ServerStatsConfig): ServerStatsConfig {
  return config
}
