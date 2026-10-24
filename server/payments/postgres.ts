import { Pool } from 'pg'
import { attachDatabasePool } from '@vercel/functions'
import type { Database, SqlClient } from './store.ts'

export function postgresDatabase(connectionString: string): Database {
  const pool = new Pool({ connectionString, max: 3, idleTimeoutMillis: 5000, connectionTimeoutMillis: 5000, statement_timeout: 10000 })
  attachDatabasePool(pool)
  pool.on('error', () => console.error(JSON.stringify({ event: 'payment_database_connection_error' })))
  return {
    query: (sql, values) => pool.query(sql, values),
    async transaction<T>(work: (client: SqlClient) => Promise<T>): Promise<T> {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await work(client)
        await client.query('COMMIT')
        return result
      } catch (error) { await client.query('ROLLBACK'); throw error }
      finally { client.release() }
    },
  }
}
