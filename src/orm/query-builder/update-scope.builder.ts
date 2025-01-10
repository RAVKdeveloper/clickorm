import { Connection } from '../connection/connection'
import { EntityTarget } from '../types/common.type'
import { ExecuteFunction, WhereConditions } from '../types/query-builder.type'
import { QueryBuilderUtils } from './utils'

export class UpdateScopeBuilder<T> {
  private entity: EntityTarget<T>
  private setSql: string = ''
  private tableName: string = ''
  private whereSql: string = ''

  constructor(
    private readonly executor: ExecuteFunction<any>,
    private readonly connection: Connection
  ) {}

  public async execute() {
    const sql = this.generateSql()
    return await this.executor.apply(this, [sql])
  }

  public from<T>(entity: EntityTarget<T>) {
    this.entity = entity as any
    this.tableName = QueryBuilderUtils.getTableName(entity)

    return {
      set: (data: Partial<T> | Partial<T>[]) =>
        this.set.apply(this, [data]) as UpdateScopeBuilder<T>,
      where: (conditions: WhereConditions<T>[]) =>
        this.where.apply(this, [conditions]) as UpdateScopeBuilder<T>,
      execute: async () => await this.execute.apply(this)
    }
  }

  public where(conditions: WhereConditions<T>[]) {
    const strings: string[] = []

    conditions.forEach((cond) => {
      strings.push(`${cond.column.toString()} ${cond.expr}`)
    })

    this.whereSql = strings.join(' AND ')

    return this
  }

  public set(data: Partial<T> | Partial<T>[]) {
    if (!Array.isArray(data)) {
      data = [data]
    }

    const tableName = QueryBuilderUtils.getTableName(this.entity)
    const strings: string[] = []

    data.forEach((d) => {
      Object.entries(d).forEach(([k, v]) => {
        const column = QueryBuilderUtils.getColumnDBName(k, tableName)

        strings.push(`${column} = ${typeof v === 'string' ? `'${v}'` : v}`)
      })
    })

    this.setSql = strings.join(',')

    return this
  }

  private generateSql() {
    const where = this.whereSql ? `WHERE ${this.whereSql}` : ''
    return `ALTER TABLE ${this.tableName} UPDATE ${this.setSql} ${where}`
  }
}
