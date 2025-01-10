import { Connection } from '../connection/connection'
import { Class } from '../types/common.type'
import { ExecuteFunction } from '../types/query-builder.type'
import { QueryBuilderUtils } from './utils'

export class DropCmdScopBuilder {
  private finalizeStrSql: string = ''
  private readonly executor: ExecuteFunction<any>

  constructor(
    executor: ExecuteFunction<any>,
    private readonly connection: Connection
  ) {
    this.finalizeStrSql = 'DROP '
    this.executor = executor
  }

  public database(name: string) {
    this.finalizeStrSql += `DATABASE ${name};`

    return this.executorApply
  }

  public table(name: string | Class) {
    const tableName = QueryBuilderUtils.getTableName(name)

    this.finalizeStrSql += `TABLE ${tableName};`

    return this.executorApply
  }

  public column(tableName: string | Class, columnName: string) {
    tableName = QueryBuilderUtils.getTableName(tableName)
    columnName = QueryBuilderUtils.getColumnDBName(columnName, tableName)

    this.finalizeStrSql = `ALTER TABLE ${tableName} DROP COLUMN ${columnName};`

    return this.executorApply
  }

  public index(idxName: string) {
    this.finalizeStrSql += `INDEX ${idxName};`

    return this.executorApply
  }

  private get executorApply() {
    return {
      execute: () => this.executor.apply(this, [this.finalizeStrSql]),
      sql: this.finalizeStrSql
    }
  }
}
