/**
 * Type declarations for Vercel build compatibility
 * These declarations ensure TypeScript doesn't complain about missing types
 * during the build process on Vercel
 */

declare module 'pg' {
  export interface QueryResultRow {
    [column: string]: any
  }
  
  export interface QueryResult<T extends QueryResultRow = QueryResultRow> {
    rows: T[]
    rowCount: number
    command: string
    oid: number
    fields: any[]
  }
  
  export interface PoolConfig {
    connectionString?: string
    max?: number
    ssl?: any
    connectionTimeoutMillis?: number
    idleTimeoutMillis?: number
    allowExitOnIdle?: boolean
  }
  
  export class Pool {
    constructor(config?: PoolConfig)
    query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: any[]
    ): Promise<QueryResult<T>>
    end(): Promise<void>
  }
  
  export class Client {
    constructor(config?: PoolConfig | string)
    query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: any[]
    ): Promise<QueryResult<T>>
    connect(): Promise<void>
    end(): Promise<void>
  }
}

declare module 'cors' {
  import { Request, Response, NextFunction } from 'express'
  
  export interface CorsOptions {
    origin?: boolean | string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void)
    credentials?: boolean
    methods?: string | string[]
    allowedHeaders?: string | string[]
    exposedHeaders?: string | string[]
    maxAge?: number
    preflightContinue?: boolean
    optionsSuccessStatus?: number
  }
  
  export default function cors(options?: CorsOptions): (req: Request, res: Response, next: NextFunction) => void
}

