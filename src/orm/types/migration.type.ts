import { DataSource } from '../data-source/data-source'

export interface Migration {
  name: string
  migrationName: string
  up?: (dataSource: DataSource) => Promise<void>
}

export type MigrationClass = new () => Migration

export interface CreateMigrationOpts {
  setTimestamp?: number, 
  outputPath?: string
}