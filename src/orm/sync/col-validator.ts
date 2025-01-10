import { dbTypesToOrmTypes } from '../constants/db-types.constants'
import { ColumnBuilder } from '../metadata-builder/column.builder'
import { MetaCol } from '../types/metadata.type'
import { DbColumn } from '../types/sync.type'

export class ColumnSyncMetaValidator {
  constructor(private readonly tableName: string) {}

  public isChangeType(col: DbColumn, entityCol: MetaCol) {
    const entityColumnType = new ColumnBuilder(entityCol).getType()
    const entityColToLowercase = entityColumnType.toLowerCase()
    let columnType = col.type.toLowerCase()

    if (Object.keys(dbTypesToOrmTypes).includes(columnType)) {
      columnType = dbTypesToOrmTypes[columnType]
    }

    if (entityColToLowercase !== columnType) {
      return `ALTER TABLE ${this.tableName} MODIFY COLUMN ${entityCol.name} ${entityColumnType}`
    }

    return null
  }

  public isChangeDefault(col: DbColumn, entityCol: MetaCol) {
    const entityColumnBuild = new ColumnBuilder(entityCol)

    if (!col.default_type && !entityColumnBuild.getDefault()) {
      return null
    }

    if (!col.default_type && entityColumnBuild.getDefault()) {
      return `ALTER TABLE ${this.tableName} MODIFY COLUMN ${
        col.name
      }${entityColumnBuild.getDefault()}`
    }

    if (col.default_expression && !entityColumnBuild.getDefault()) {
      return `ALTER TABLE ${this.tableName} ALTER COLUMN ${col.name} DROP DEFAULT`
    }

    if (
      `${col.default_type} ${col.default_expression}`.trim().toLowerCase() !==
      entityColumnBuild.getDefault().trim().toLowerCase()
    ) {
      return `ALTER TABLE ${this.tableName} MODIFY COLUMN ${
        col.name
      }${entityColumnBuild.getDefault()}`
    }

    return null
  }

  public isNewColumn(
    col: DbColumn | undefined,
    entityCol: MetaCol | undefined
  ) {
    const cmds: string[] = []

    if (col && entityCol) {
      return null
    }

    if (!col && entityCol) {
      const builder = new ColumnBuilder(entityCol)
      cmds.push(
        `ALTER TABLE ${this.tableName} ADD COLUMN ${builder.generateSql()}`
      )
    }

    if (!entityCol && col) {
      cmds.push(`ALTER TABLE ${this.tableName} DROP COLUMN ${col.name}`)
    }

    return cmds.length > 0 ? cmds : null
  }

  public deleteColumn(colName: string) {
    return `ALTER TABLE ${this.tableName} DROP COLUMN ${colName}`
  }
}
