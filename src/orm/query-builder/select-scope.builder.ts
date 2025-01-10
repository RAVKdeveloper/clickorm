import { Connection } from '../connection/connection'
import { Class, EntityTarget } from '../types/common.type'
import { ExecuteFunction, WhereConditions } from '../types/query-builder.type'
import { QueryBuilderUtils } from './utils'

export class SelectScopeBuilder<ReturnEntity = Record<string, any>> {
  private finalizeStrSql: string = ''
  private entity: EntityTarget<ReturnEntity>
  private finalColumns: string = ''
  private takeSql: string = ''
  private skipSql: string = ''
  private isDistinct: boolean = false
  private orderBySql: string[] = []
  private whereSql: string = ''

  constructor(
    private readonly executor: ExecuteFunction<any>,
    private readonly connection: Connection
  ) {}

  public async getMany(): Promise<ReturnEntity[]> {
    this.generateSql()
    return await this.executorApply.execute()
  }

  public async getOne(): Promise<ReturnEntity | null> {
    this.isDistinct = true
    this.generateSql()
    const result = await this.executorApply.execute()

    if (!Array.isArray(result)) {
      throw new Error('Expect array on getOne action!')
    }

    if (!result[0]) {
      return null
    }

    return result[0]
  }

  public columns(cols: string | string[]) {
    const tableName = QueryBuilderUtils.getTableName(this.entity)
    if (typeof cols === 'string') {
      if (cols === '*') {
        const columns = QueryBuilderUtils.selectedColsWithAlias(
          [],
          this.entity,
          true
        )
        this.finalColumns = columns.join(',')

        return this
      } else {
        throw new Error(`Unknown operator! Expect "*", received ${cols}`)
      }
    }

    let dbColumnNames: string[] = []

    for (const col of cols) {
      const colDbName = QueryBuilderUtils.getColumnDBName(col, tableName)
      dbColumnNames.push(colDbName)
    }

    dbColumnNames = QueryBuilderUtils.selectedColsWithAlias(
      dbColumnNames,
      this.entity
    )

    this.finalColumns = dbColumnNames.join(',')

    return this
  }

  public from<T>(entity: EntityTarget<T>) {
    this.entity = entity as EntityTarget<any>

    return {
      columns: (cols: string | string[]) =>
        this.columns.apply(this, [cols]) as SelectScopeBuilder<T>
    }
  }

  public take(count: number) {
    this.takeSql = `LIMIT ${count}`

    return this
  }

  public skip(count: number) {
    this.skipSql = `OFFSET ${count}`

    return this
  }

  public where(conditions: WhereConditions<ReturnEntity>[]) {
    const strings: string[] = []

    conditions.forEach((cond) => {
      strings.push(`${cond.column.toString()} ${cond.expr}`)
    })

    this.whereSql = strings.join(' AND ')

    return this
  }

  public orderBy(colName: string, type: 'DESC' | 'ASC') {
    const tableName = QueryBuilderUtils.getTableName(this.entity)
    const colDbName = QueryBuilderUtils.getColumnDBName(colName, tableName)

    let str = `ORDER BY `

    if (this.orderBySql.length > 0) {
      str = `${colDbName} ${type}`
      this.orderBySql.push(str)
    } else {
      str += `${colDbName} ${type}`
      this.orderBySql.push(str)
    }

    return this
  }

  public get sql() {
    return this.generateSql()
  }

  private get executorApply() {
    return {
      execute: () => this.executor.apply(this, [this.finalizeStrSql]),
      sql: this.finalizeStrSql
    }
  }

  private generateSql() {
    const tableName = QueryBuilderUtils.getTableName(this.entity)
    const distinct = this.isDistinct ? 'DISTINCT' : ''
    const orderBy = this.orderBySql.join(',')

    this.finalizeStrSql = `SELECT ${distinct} ${
      this.finalColumns
    } FROM ${tableName} ${
      this.whereSql ? `WHERE ${this.whereSql}` : ''
    } ${orderBy} ${this.takeSql} ${this.skipSql}`

    return this.finalizeStrSql
  }
}
