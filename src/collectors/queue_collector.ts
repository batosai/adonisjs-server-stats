import type { MetricCollector } from './collector.js'

/**
 * Redis connection details for BullMQ.
 */
export interface QueueRedisConnection {
  /** Redis host. */
  host: string

  /** Redis port. */
  port: number

  /** Redis password (optional for passwordless connections). */
  password?: string
}

/**
 * Options for {@link queueCollector}.
 */
export interface QueueCollectorOptions {
  /**
   * BullMQ queue name to monitor.
   * @default 'default'
   */
  queueName?: string

  /**
   * Redis connection used by BullMQ.
   *
   * This is a **separate** connection from your AdonisJS Redis config
   * because BullMQ manages its own connections internally.
   *
   * @example
   * ```ts
   * connection: {
   *   host: env.get('QUEUE_REDIS_HOST'),
   *   port: env.get('QUEUE_REDIS_PORT'),
   *   password: env.get('QUEUE_REDIS_PASSWORD'),
   * }
   * ```
   */
  connection: QueueRedisConnection
}

/**
 * Monitors a BullMQ job queue for active, waiting, delayed, and failed jobs.
 *
 * Creates a temporary BullMQ `Queue` instance each tick to fetch counts,
 * then immediately closes it.
 *
 * **Metrics produced:**
 * - `queueActive` -- jobs being processed
 * - `queueWaiting` -- jobs waiting for a worker
 * - `queueDelayed` -- jobs scheduled for the future
 * - `queueFailed` -- permanently failed jobs
 * - `queueWorkerCount` -- connected worker processes
 *
 * Returns zeros if BullMQ is unavailable or the queue cannot be reached.
 *
 * **Peer dependencies:** `bullmq`
 *
 * @example
 * ```ts
 * import { queueCollector } from 'adonisjs-server-stats/collectors'
 *
 * queueCollector({
 *   queueName: 'default',
 *   connection: { host: 'localhost', port: 6379, password: 'secret' },
 * })
 * ```
 */
export function queueCollector(opts: QueueCollectorOptions): MetricCollector {
  const queueName = opts.queueName ?? 'default'

  return {
    name: 'queue',

    async collect() {
      try {
        const { Queue } = await import('bullmq')
        const queue = new Queue(queueName, { connection: opts.connection })
        const [counts, workers] = await Promise.all([queue.getJobCounts(), queue.getWorkers()])
        await queue.close()
        return {
          queueActive: counts.active ?? 0,
          queueWaiting: counts.waiting ?? 0,
          queueDelayed: counts.delayed ?? 0,
          queueFailed: counts.failed ?? 0,
          queueWorkerCount: workers.length,
        }
      } catch {
        return {
          queueActive: 0,
          queueWaiting: 0,
          queueDelayed: 0,
          queueFailed: 0,
          queueWorkerCount: 0,
        }
      }
    },
  }
}
