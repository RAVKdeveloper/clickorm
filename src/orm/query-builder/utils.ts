import 'reflect-metadata'
import { Global } from '../global'
import { Class, EntityTarget } from '../types/common.type'
import { MetaCol, MetadataKeys } from '../types/metadata.type'

export class QueryBuilderUtils {
  public static getTableName(name: string | EntityTarget<any>): string {
    let tableName: string = ''

    if (typeof name === 'string') {
      tableName = name
    }

    if (typeof name !== 'string') {
      const entity = Global.entities.find((e) => name.name === e.name)

      if (!entity) {
        throw new Error(`Not found entity! Received entity -> ${name.name}`)
      }

      tableName = entity.tableName
    }

    return tableName
  }

  public static getColumnDBName(colName: string, tableName: string | Class) {
    tableName = this.getTableName(tableName)

    const foundedTable = Global.entities.find((e) => e.tableName === tableName)

    if (!foundedTable) {
      throw new Error('Not found table!')
    }

    const metaColumns: MetaCol[] =
      Reflect.getMetadata(MetadataKeys.COL, foundedTable.target) ?? []

    const foundedColumn = metaColumns.find((c) => c.propertyKey === colName)

    if (!foundedColumn) {
      throw new Error(
        `Not found column! Received column "${colName}" in table "${tableName}" does not exist!`
      )
    }

    return foundedColumn.name
  }

  public static getColumns(Entity: EntityTarget<any>) {
    const columns: MetaCol[] =
      Reflect.getMetadata(MetadataKeys.COL, Entity) ?? []

    return columns
  }

  public static selectedColsWithAlias(
    cols: string[],
    entity: EntityTarget<any>,
    all = false
  ) {
    const ormColumns = this.getColumns(entity)

    const result: string[] = []

    if (!all) {
      for (const col of cols) {
        const foundedCol = ormColumns.find((c) => c.name === col)

        if (!foundedCol) {
          throw new Error(`Missing column! Received ${col}`)
        }

        result.push(`${col} AS ${foundedCol.propertyKey}`)
      }
    } else {
      ormColumns.forEach((col) => {
        result.push(`${col.name} AS ${col.propertyKey}`)
      })
    }

    return result
  }
}
