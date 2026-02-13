import type { MetricCollector } from './collector.js'

/**
 * Queries application-specific tables for user sessions,
 * pending webhooks, and pending emails.
 *
 * Expects `sessions`, `webhook_events`, and `scheduled_emails` tables
 * to exist. Missing tables are silently ignored (returns 0).
 *
 * **Metrics produced:**
 * - `onlineUsers` -- active session count
 * - `pendingWebhooks` -- webhook events awaiting delivery
 * - `pendingEmails` -- scheduled emails awaiting send
 *
 * **Peer dependencies:** `@adonisjs/lucid`
 */
export function appCollector(): MetricCollector {
  return {
    name: 'app',

    async collect() {
      try {
        const { default: db } = await import('@adonisjs/lucid/services/db')

        const [sessions, webhooks, emails] = await Promise.all([
          db
            .from('sessions')
            .count('* as total')
            .first()
            .then((r: any) => Number(r?.total ?? 0)),
          db
            .from('webhook_events')
            .where('status', 'pending')
            .count('* as total')
            .first()
            .then((r: any) => Number(r?.total ?? 0))
            .catch(() => 0),
          db
            .from('scheduled_emails')
            .where('status', 'pending')
            .count('* as total')
            .first()
            .then((r: any) => Number(r?.total ?? 0))
            .catch(() => 0),
        ])
        return {
          onlineUsers: sessions,
          pendingWebhooks: webhooks,
          pendingEmails: emails,
        }
      } catch {
        return { onlineUsers: 0, pendingWebhooks: 0, pendingEmails: 0 }
      }
    },
  }
}
