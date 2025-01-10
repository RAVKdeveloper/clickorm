import path from 'path'
import { Connection } from '../connection/connection'
import { DataSourceOpt } from './data-source.type'
import { importClassesFromDirectories } from '../utils/load-entities.utils'
import {
  DEFAULT_DB_CONNECTION_NAME,
  DEFAULT_ENTITIES_PATH
} from '../constants/default.constants'
import { QueryBuilder } from '../query-builder/query-builder'
import { randomUUID } from 'crypto'
import { EntityTarget } from '../types/common.type'
import { Repository } from '../repository/repository'
import { Global } from '../global'
import { Sync } from '../sync/sync'
import { TransactionManager } from '../tx/tx-manager'
import { MigrationRunner } from '../migrations/migration.runner'

export class DataSource {
  readonly '@instanceof' = Symbol.for('DataSource')

  public static async init(opt: DataSourceOpt) {
    const dataSource = new DataSource(opt)
    await dataSource['loadEntities']()
    await dataSource.healthCheck()
    await dataSource['sync']()
    const migrationRunner = await MigrationRunner.create(
      dataSource.getUnSyncMetadata,
      dataSource.connection,
      opt.migrationsTable,
      opt.migrationsDir
    )
    dataSource.setRunner = migrationRunner
    return dataSource
  }

  private readonly defaultConnectionName = DEFAULT_DB_CONNECTION_NAME

  private readonly connection: Connection
  private opt: DataSourceOpt

  // Connections map
  private readonly connections: Record<string, Connection>

  private syncService: Sync
  private unSyncMetadata: string[] = []

  public migrationRunner!: MigrationRunner

  constructor(opt: DataSourceOpt) {
    this.opt = opt
    this.connection = Connection.create(opt)
    this.connections = { [this.defaultConnectionName]: this.connection }
    this.syncService = new Sync(this.connection, opt.sync ?? false)

    if (opt.logging) {
      Global.isLogging = true
    }
  }

  public set setRunner(runner: MigrationRunner) {
    this.migrationRunner = runner
  }

  public get getConnections() {
    return this.connections
  }

  public get currentConnection() {
    return this.connection
  }

  public get getUnSyncMetadata() {
    return this.unSyncMetadata
  }

  public setOptions(opt: Partial<DataSourceOpt>) {
    this.opt = { ...this.opt, ...opt }
  }

  public createQueryBuilder(connectionName = this.defaultConnectionName) {
    const connection = this.connections[connectionName]

    if (!connection) {
      throw new Error(`Not found connection, received ${connectionName}`)
    }

    return new QueryBuilder(connection)
  }

  public createQueryRunner(connectionName: string = randomUUID()) {
    const newConnection = Connection.create(this.opt)
    this.connections[connectionName] = newConnection
    return new TransactionManager(newConnection)
  }

  public async healthCheck(conName: string = 'default') {
    await this.connections[conName].ping()
  }

  public getRepo<T>(entity: string | EntityTarget<T>) {
    let name: string = ''

    if (typeof entity === 'string') {
      name = entity
    } else {
      name = entity.name
    }

    const entityTarget = Global.entities.find((e) => e.name === name)

    if (!entityTarget) {
      throw new Error(`Not found entity by name ${name}!`)
    }

    return new Repository<T>(this.connection, entityTarget.target)
  }

  private async loadEntities() {
    const pathArr =
      this.opt.entities ??
      [DEFAULT_ENTITIES_PATH].map((p) => path.join(process.cwd(), p))
    await importClassesFromDirectories(pathArr)
  }

  private async sync() {
    const sqlCommands = await this.syncService.synchronize()

    this.unSyncMetadata = sqlCommands
  }
}
