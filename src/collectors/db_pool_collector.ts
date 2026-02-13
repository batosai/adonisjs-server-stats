import type { MetricCollector } from './collector.js'

/**
 * Options for {@link dbPoolCollector}.
 */
export interface DbPoolCollectorOptions {
  /**
   * Lucid database connection name to monitor.
   *
   * Must match a key in your `config/database.ts` connections object.
   *
   * @default 'postgres'
   */
  connectionName?: string
}

/**
 * Monitors the Knex connection pool for a Lucid database connection.
 *
 * **Metrics produced:**
 * - `dbPoolUsed` -- connections currently checked out
 * - `dbPoolFree` -- idle connections available
 * - `dbPoolPending` -- queries waiting for a connection
 * - `dbPoolMax` -- maximum pool size
 *
 * Returns zeros if the connection or pool is unavailable.
 *
 * **Peer dependencies:** `@adonisjs/lucid`
 *
 * @example
 * ```ts
 * import { dbPoolCollector } from 'adonisjs-server-stats/collectors'
 *
 * dbPoolCollector()                                // monitor 'postgres'
 * dbPoolCollector({ connectionName: 'mysql' })     // monitor 'mysql'
 * ```
 */
export function dbPoolCollector(opts?: DbPoolCollectorOptions): MetricCollector {
  const connectionName = opts?.connectionName ?? 'postgres'

  return {
    name: 'db_pool',

    async collect() {
      try {
        const { default: db } = await import('@adonisjs/lucid/services/db')
        const connection = db.manager.get(connectionName)
        if (!connection) {
          return { dbPoolUsed: 0, dbPoolFree: 0, dbPoolPending: 0, dbPoolMax: 0 }
        }
        const pool = (connection.connection as any)?.pool
        if (!pool) {
          return { dbPoolUsed: 0, dbPoolFree: 0, dbPoolPending: 0, dbPoolMax: 0 }
        }
        return {
          dbPoolUsed: pool.numUsed?.() ?? 0,
          dbPoolFree: pool.numFree?.() ?? 0,
          dbPoolPending: pool.numPendingAcquires?.() ?? 0,
          dbPoolMax: pool.max ?? 0,
        }
      } catch {
        return { dbPoolUsed: 0, dbPoolFree: 0, dbPoolPending: 0, dbPoolMax: 0 }
      }
    },
  }
}
