import path from 'path'
import fs from 'fs'
import { CreateMigrationOpts, MigrationClass } from '../types/migration.type'
import { importClassesFromDirectories } from '../utils/load-entities.utils'
import { DEFAULT_MIGRATIONS_PATH } from '../constants/default.constants'
import { getMigrations } from '../utils/getMigrations.utils'
import { MigrationsTable } from './migrations-table'
import { Connection } from '../connection/connection'
import { DataSource } from '../data-source/data-source'
import { MigrationExecutor } from './migration.executor'
import { OrmLogger } from '../logger/default.logger'

export class MigrationRunner {
  public static async create(
    unSyncMetadata: string[],
    connection: Connection,
    migrationTableName?: string,
    migrationsPath?: string
  ) {
    const runner = new MigrationRunner(
      unSyncMetadata,
      connection,
      migrationTableName,
      migrationsPath
    )
    await runner['loadMigrations']()
    return runner
  }

  private readonly migrationTable: MigrationsTable
  private migrations: MigrationClass[] = []
  private readonly logger: OrmLogger = new OrmLogger()

  constructor(
    private readonly unSyncMetadata: string[],
    private readonly connection: Connection,
    private readonly migrationTableName?: string,
    private readonly migrationsPath?: string
  ) {
    this.migrationTable = new MigrationsTable(
      this.connection,
      this.migrationTableName
    )
  }

  public async run(dataSource: DataSource) {
    const executor = new MigrationExecutor(this.migrationTable)

    for await (const migration of this.migrations) {
      await executor.execute(migration, dataSource)
    }

    this.migrations = []
  }

  public async createMigration(name: string, opt?: CreateMigrationOpts) {
    if (this.unSyncMetadata.length === 0) {
      process.exit(1)
    }

    const timestamp = opt?.setTimestamp ?? Date.now()
    const template = `
class ${name}_${timestamp}Migration {
    migrationName = '${name}_${timestamp}_migration'

    async up(dataSource) {
        ${this.unSyncMetadata
          .map((m) => `await dataSource.createQueryBuilder().query("${m}")`)
          .join('\n')}
    }
}

module.exports = { ${name}_${timestamp}Migration }
    `

    const fileName = `${name}_${timestamp}.js`
    const pathToFile = path.join(
      process.cwd(),
      opt?.outputPath ?? this.migrationsPath ?? DEFAULT_MIGRATIONS_PATH
    )

    fs.writeFileSync(`${pathToFile}/${fileName}`, template, {
      encoding: 'utf-8'
    })

    this.logger.info(
      `Successful create migration ${name}, path ${pathToFile}/${fileName}`
    )
  }

  private async loadMigrations() {
    const configMigrationsPath = this.migrationsPath
      ? this.migrationsPath.endsWith('/')
        ? this.migrationsPath + '*.{ts,js}'
        : this.migrationsPath + '/*.{ts,js}'
      : undefined
    const pathArr = configMigrationsPath
      ? [configMigrationsPath]
      : [DEFAULT_MIGRATIONS_PATH].map((p) => path.join(process.cwd(), p))
    const data = (await importClassesFromDirectories(pathArr)) as any
    const migrations = getMigrations(data)
    await this.migrationTable.createIfNotExist()
    this.migrations = migrations
  }
}
