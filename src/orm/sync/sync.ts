import { Connection } from '../connection/connection'
import { Entity, Global } from '../global'
import { OrmLogger } from '../logger/default.logger'
import { EntityBuilder } from '../metadata-builder/entity.builder'
import { QueryBuilderUtils } from '../query-builder/utils'
import { MetaCol } from '../types/metadata.type'
import { DbColumn, DdIndex } from '../types/sync.type'
import { ColumnSyncMetaValidator } from './col-validator'
import { IndexValidator } from './index-validator'

export class Sync {
  private newSqlCommands: string[] = []
  private readonly logger: OrmLogger = new OrmLogger()

  constructor(
    private readonly connection: Connection,
    private readonly auto: boolean
  ) {}

  public async synchronize() {
    const entities = Global.entities

    await Promise.all(
      entities.map(async (entity) => {
        const tableName = QueryBuilderUtils.getTableName(entity.target)
        const columns = QueryBuilderUtils.getColumns(entity.target)

        try {
          const table = (await this.connection.getTableMetadata(
            tableName
          )) as DbColumn[]
          const tableIndexes = await this.connection.getTableIndexes(tableName)
          this.syncColumns(table, columns, tableName)
          this.syncIndexes(tableIndexes, columns, tableName)
        } catch (e) {
          await this.buildEntity(entity)
        }
      })
    )

    if (this.auto) {
      await Promise.all(
        this.newSqlCommands.map(async (q) => {
          this.logger.query(q)
          await this.connection.query(q)
        })
      )
    }

    return this.newSqlCommands
  }

  private syncIndexes(indexes: DdIndex[], cols: MetaCol[], tableName: string) {
    const indexValidator = new IndexValidator(tableName, this.connection)

    indexes.forEach((i) => {
      if (i.index_type === 'PRIMARY') {
        const sql = indexValidator.isChangePrimaryKey(i, cols)

        if (sql) {
          this.newSqlCommands.push(...sql)
        }

        return
      }
    })
  }

  private syncColumns(
    columns: DbColumn[],
    entityColumns: MetaCol[],
    tableName: string
  ) {
    const validateStructure: Array<
      [DbColumn | undefined, MetaCol | undefined]
    > = []
    entityColumns.forEach((col) => {
      const dbColumn = columns.find((c) => col.name === c.name)

      validateStructure.push([dbColumn, col])
    })

    const columnValidator = new ColumnSyncMetaValidator(tableName)

    columns.forEach((col) => {
      const entityCol = entityColumns.find((c) => c.name === col.name)

      if (!entityCol) {
        this.newSqlCommands.push(columnValidator.deleteColumn(col.name))
        return
      }

      return
    })

    validateStructure.forEach((structure) => {
      const sqlToNewCol = columnValidator.isNewColumn(...structure)

      if (sqlToNewCol) {
        this.newSqlCommands.push(...sqlToNewCol)
        return
      }

      const sqlToChangeType = columnValidator.isChangeType(
        structure[0] as DbColumn,
        structure[1] as MetaCol
      )

      if (sqlToChangeType) {
        this.newSqlCommands.push(sqlToChangeType)
      }

      const sqlToDefault = columnValidator.isChangeDefault(
        structure[0] as DbColumn,
        structure[1] as MetaCol
      )

      if (sqlToDefault) {
        this.newSqlCommands.push(sqlToDefault)
      }
    })
  }

  private async buildEntity(entity: Entity) {
    const builder = new EntityBuilder(entity)
    const sql = await builder.generateSql(this.connection)
    this.newSqlCommands.push(sql)
    return sql
  }
}
