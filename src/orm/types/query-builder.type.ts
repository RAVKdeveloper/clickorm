import { engines } from '../constants/db-types.constants'

export type ExecuteFunction<T> = (sql: string) => Promise<T>

export interface ReturnExecutor<T> {
  readonly execute: () => Promise<ExecuteFunction<T>>
  readonly sql: string
}

export type InsertExecuteFunction<T> = (
  tableName: string,
  values: Record<string, any>[]
) => Promise<T>

export interface ReturnInsertExecutor<T> {
  readonly execute: () => Promise<Record<string, any>>
  readonly sql: string
}

export type Engine = keyof typeof engines

export interface ReturnGetOperators<T> {
  getMany: () => Promise<T[]>
  getOne: () => Promise<T | null>
  sql: string
}

export interface WhereConditions<T> {
  readonly column: keyof T
  readonly expr: string
}
