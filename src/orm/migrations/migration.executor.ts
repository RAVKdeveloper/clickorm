import { DataSource } from '../data-source/data-source'
import { OrmLogger } from '../logger/default.logger'
import { MigrationClass } from '../types/migration.type'
import { MigrationsTable } from './migrations-table'

export class MigrationExecutor {
  private readonly logger: OrmLogger = new OrmLogger()

  constructor(private readonly migrationTable: MigrationsTable) {}

  public async execute(Migration: MigrationClass, dataSource: DataSource) {
    const instance = new Migration()

    try {
      const isCommitted = await this.migrationTable.getMigration(
        instance.migrationName
      )

      if (isCommitted) {
        return
      }

      if (!instance.up) {
        return
      }

      await instance.up(dataSource)
      await this.migrationTable.insert(instance.migrationName)

      this.logger.info(`Complete Migration ${instance.migrationName}!`)
    } catch (e) {
      throw new Error(
        `Migration ${instance.migrationName} execute error!\nDetails: ${e}`
      )
    }
  }
}
