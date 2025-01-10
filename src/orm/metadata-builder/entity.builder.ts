import 'reflect-metadata'
import { Entity } from '../global'
import { QueryBuilder } from '../query-builder/query-builder'
import { MetaCol, MetadataKeys } from '../types/metadata.type'
import { Connection } from '../connection/connection'

export class EntityBuilder {
  constructor(private readonly data: Entity) {}

  public async generateSql(connection: Connection) {
    const queryBuilder = new QueryBuilder(connection)
    const columnsMeta = this.getColumnsMeta()
    const engine = this.data.engine

    const builder = queryBuilder
      .create()
      .table(this.data.tableName, columnsMeta, engine)

    return builder.sql
  }

  private getColumnsMeta() {
    const columns: MetaCol[] =
      Reflect.getMetadata(MetadataKeys.COL, this.data.target) ?? []

    return columns
  }
}
