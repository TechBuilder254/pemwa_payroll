import { Pool, QueryResult, QueryResultRow } from 'pg'

const connectionString = process.env.DATABASE_URL

export const pool = new Pool({
  connectionString,
  max: 10,
})

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const res = await pool.query<T>(text, params)
  return res
}



