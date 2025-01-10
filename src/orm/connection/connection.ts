import {
  ClickHouseClient,
  ClickHouseConnectionProtocol
} from '@depyronick/clickhouse-client'
import { ClickHouse } from 'clickhouse'

import type { ConnectionOptions } from './connection.type'
import { DdIndex } from '../types/sync.type'

export class Connection {
  public static create(opt: ConnectionOptions) {
    return new Connection(opt)
  }

  private readonly client: ClickHouse
  private readonly metaClient: ClickHouseClient

  constructor(private readonly opt: ConnectionOptions) {
    this.client = this.buildClient(opt)
    this.metaClient = this.buildMetaClient(opt)
  }

  public async query(sql: string) {
    return await this.client.query(sql).toPromise()
  }

  public async getTableMetadata(tableName: string) {
    return await this.metaClient.queryPromise(`desc ${tableName}`)
  }

  public async getTableIndexes(tableName: string): Promise<DdIndex[]> {
    return (await this.metaClient.queryPromise(
      `show index from ${tableName}`
    )) as DdIndex[]
  }

  public async insert(table: string, values: Record<string, any>[]) {
    return await this.client.insert(table, values).toPromise()
  }

  public async ping() {
    return await this.client.query('SHOW TABLES;').toPromise()
  }

  public async createConnection() {}

  private buildMetaClient(opt: ConnectionOptions) {
    const client = new ClickHouseClient({
      username: this.opt.username,
      password: this.opt.password,
      database: this.opt.database,
      host: this.opt.host,
      port: this.opt.port,
      httpConfig: {
        protocol:
          this.opt?.ssl ?? false
            ? ClickHouseConnectionProtocol.HTTPS
            : ClickHouseConnectionProtocol.HTTP
      }
    })

    return client
  }

  private buildClient(opt: ConnectionOptions): ClickHouse {
    const protocol = this.opt.ssl ? 'https://' : 'http://'

    const client = new ClickHouse({
      basicAuth: {
        username: this.opt.username,
        password: this.opt.password
      },
      port: this.opt.port,
      url: `${protocol}${this.opt.host}`,
      config: {
        database: this.opt.database
      }
    })

    return client
  }
}
