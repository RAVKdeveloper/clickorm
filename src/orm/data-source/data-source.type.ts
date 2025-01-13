import { ConnectionOptions } from '../connection/connection.type'
import { EntityTarget } from '../types/common.type'

export interface DataSourceOpt extends ConnectionOptions {
  migrationsTable?: string
  entities?: string[] | EntityTarget<any>[]
  migrationsDir?: string
  sync?: boolean
  logging?: boolean
}
