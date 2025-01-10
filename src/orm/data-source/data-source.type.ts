import { ConnectionOptions } from '../connection/connection.type'

export interface DataSourceOpt extends ConnectionOptions {
  migrationsTable?: string
  entities?: string[]
  migrationsDir?: string
  sync?: boolean
  logging?: boolean
}
