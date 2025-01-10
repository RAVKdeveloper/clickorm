import { UUID } from 'crypto'
import { Connection } from '../connection/connection'
import { QueryBuilder } from '../query-builder'

export interface IMigrationTable {
  readonly id: UUID
  readonly timestamp: bigint
  readonly name: string
}

export class MigrationsTable {
  constructor(
    private readonly connection: Connection,
    private readonly name: string = 'migrations'
  ) {}

  public async createIfNotExist() {
    const queryBuilder = new QueryBuilder(this.connection)

    await queryBuilder.query(`CREATE TABLE IF NOT EXISTS ${this.name} (
        id UUID DEFAULT generateUUIDv4() PRIMARY KEY,
        timestamp DateTime DEFAULT now(),
        name String
    ) engine = MergeTree`)
  }

  public async insert(migrationName: string) {
    return await this.connection.query(
      `INSERT INTO ${this.name} (name) VALUES ('${migrationName}')`
    )
  }

  public async getMigration(
    migrationName: string
  ): Promise<null | IMigrationTable> {
    const queryBuilder = new QueryBuilder(this.connection)

    const migrations = (await queryBuilder.query(
      `SELECT * FROM ${this.name} WHERE name = '${migrationName}'`
    )) as IMigrationTable[]

    if (!migrations) {
      return null
    }

    if (migrations.length === 0) {
      return null
    } else {
      return migrations[0]
    }
  }
}
