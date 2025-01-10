import { Connection } from '../connection/connection'
import { QueryBuilder } from '../query-builder'
import { MetaCol } from '../types/metadata.type'
import { DdIndex } from '../types/sync.type'

export class IndexValidator {
  constructor(
    private readonly tableName: string,
    private readonly connection: Connection
  ) {}

  public isChangePrimaryKey(
    index: DdIndex | undefined,
    cols: MetaCol[]
  ): string[] | null {
    const foundedPrimaryKeyCol = cols.find((c) => c.primary === true)
    const queryBuilder = new QueryBuilder(this.connection)

    if (!foundedPrimaryKeyCol && index) {
      return [queryBuilder.drop().index(index.key_name).sql]
    }

    if (foundedPrimaryKeyCol && !index) {
      return [
        queryBuilder
          .create()
          .index(this.tableName, 'PRIMARY', [foundedPrimaryKeyCol.name]).sql
      ]
    }

    if (
      foundedPrimaryKeyCol &&
      index &&
      foundedPrimaryKeyCol.name !== index?.column_name
    ) {
      const cmds: string[] = []

      const drop = new QueryBuilder(this.connection)
        .drop()
        .index(index.key_name).sql
      const newIndex = queryBuilder
        .create()
        .index(this.tableName, 'PRIMARY', [foundedPrimaryKeyCol.name]).sql

      cmds.push(drop, newIndex)

      return cmds
    }

    return null
  }
}
