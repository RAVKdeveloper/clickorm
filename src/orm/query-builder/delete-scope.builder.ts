import { Connection } from '../connection/connection'
import { EntityTarget } from '../types/common.type'
import { WhereConditions } from '../types/query-builder.type'
import { QueryBuilderUtils } from './utils'

export class DeleteScopeBuilder<Entity = any> {
  private entity: EntityTarget<Entity>
  private whereSql: string = ''

  constructor(private readonly connection: Connection) {}

  public from<T>(entity: EntityTarget<T>) {
    this.entity = entity as any

    return {
      where: (where: WhereConditions<T>[]) =>
        this.where.apply(this, [where]) as DeleteScopeBuilder<T>,
      execute: () => this.execute.apply(this) as Promise<Record<string, any>>
    }
  }

  public async execute() {
    const sql = this.generateSql()
    return await this.connection.query(sql)
  }

  private where(conditions: WhereConditions<EntityTarget<Entity>>[]) {
    const strings: string[] = []

    conditions.forEach((cond) => {
      strings.push(`${cond.column} ${cond.expr}`)
    })

    this.whereSql = strings.join(' AND ')

    return this
  }

  private getRandomColumn(): string {
    let column = QueryBuilderUtils.getColumns(this.entity).find(
      (c) => c.primary
    )

    if (!column) {
      column = QueryBuilderUtils.getColumns(this.entity).find(
        (c) => !c.nullable
      )
    }

    return column?.name as string
  }

  private generateSql() {
    const tableName = QueryBuilderUtils.getTableName(this.entity)
    let sql = `DELETE FROM ${tableName} `
    let where: string = ''

    if (!this.whereSql) {
      const col = this.getRandomColumn()
      where = `WHERE ${col} IN (SELECT ${col} FROM ${tableName})`
    } else {
      where = `WHERE ${this.whereSql}`
    }

    sql += where

    return sql
  }
}
