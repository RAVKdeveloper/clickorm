import { Connection } from '../connection/connection'
import {
  Class,
  EntityTarget,
  QueryDeepPartialEntity
} from '../types/common.type'
import {
  ExecuteFunction,
  InsertExecuteFunction,
  ReturnInsertExecutor
} from '../types/query-builder.type'
import { objectColumnsToDbKeys } from '../utils/common.utils'
import { QueryBuilderUtils } from './utils'

export class InsertScopeBuilder {
  private finalizeStrSql: string
  private entity: EntityTarget<any>
  private tableName: string
  private insertValues: Record<string, any>[]
  private fieldsList: string = ''

  constructor(
    private readonly executor: InsertExecuteFunction<any>,
    private readonly connection: Connection
  ) {
    this.finalizeStrSql = 'INSERT '
  }

  public into<T>(entity: EntityTarget<T>) {
    const tableName = QueryBuilderUtils.getTableName(entity)

    this.tableName = tableName
    this.entity = entity

    return {
      values: (
        values:
          | QueryDeepPartialEntity<typeof entity>
          | QueryDeepPartialEntity<typeof entity>[]
      ) => this.values<typeof entity>(values)
    }
  }

  private values<T>(
    values: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[]
  ) {
    const columns = QueryBuilderUtils.getColumns(this.entity)

    if (!Array.isArray(values)) {
      values = [values]
    }

    const valuesToInsert: Record<string, any>[] = []

    values.forEach((val) => {
      if (typeof val !== 'object') {
        throw new Error('Insert value must be object!')
      }

      valuesToInsert.push(objectColumnsToDbKeys(val, columns))
    })

    this.insertValues = valuesToInsert
    this.getFieldsList(values)

    return this.executorApply
  }

  private getFieldsList<T>(values: QueryDeepPartialEntity<T>[]) {
    const fields: Record<string, string> = {}

    values.forEach((val) => {
      Object.entries(val).forEach(([k, v]) => {
        const name = QueryBuilderUtils.getColumnDBName(k, this.tableName)
        if (fields[name]) return

        fields[name] = name
      })
    })

    const list = `(${Object.keys(fields).join(',')})`

    this.fieldsList = list
  }

  private get executorApply(): ReturnInsertExecutor<any> {
    return {
      execute: async () =>
        await this.executor.apply(this, [
          `INSERT INTO ${this.tableName} ${this.fieldsList}`,
          this.insertValues
        ]),
      sql: 'None'
    }
  }
}
