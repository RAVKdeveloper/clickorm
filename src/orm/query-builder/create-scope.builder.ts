import { createHash } from 'crypto'
import { Connection } from '../connection/connection'
import { ColumnBuilder } from '../metadata-builder/column.builder'
import { CreateTableColumn } from '../types/common.type'
import {
  Engine,
  ExecuteFunction,
  ReturnExecutor
} from '../types/query-builder.type'

export class CreateCmdScopeBuilder {
  private finalizeStrSql: string = ''
  private readonly executor: ExecuteFunction<any>

  constructor(
    executor: ExecuteFunction<any>,
    private readonly connection: Connection
  ) {
    this.finalizeStrSql = 'CREATE '
    this.executor = executor
  }

  public database<T>(name: string): ReturnExecutor<T> {
    this.finalizeStrSql += `DATABASE ${name}`

    return this.executorApply
  }

  public table<T>(
    name: string,
    cols: string | CreateTableColumn[],
    engine: Engine = 'MergeTree'
  ): ReturnExecutor<T> {
    if (typeof cols === 'string') {
      if (!cols.startsWith('(') || !cols.endsWith(')')) {
        throw new Error('Invalid column syntax!')
      }

      this.finalizeStrSql += `TABLE ${name} ${cols} ENGINE = ${engine};`

      return this.executorApply
    } else if (Array.isArray(cols)) {
      const sql = ColumnBuilder.buildColumnsWithBraces(cols)

      this.finalizeStrSql += `TABLE ${name} ${sql} ENGINE = ${engine};`

      return this.executorApply
    } else {
      throw new Error('Invalid input columns type!')
    }
  }

  public index(
    tableName: string,
    type: 'PRIMARY',
    cols: string[],
    indexName?: string
  ) {
    let name: string = ''

    if (indexName) {
      name = indexName
    }

    if (!name) {
      const hash = createHash('sha256')
        .update(indexName ? indexName : `${tableName}${type}${cols.join('')}`)
        .digest('hex')
      name = `${type}_${hash}`
    }

    if (type === 'PRIMARY') {
      this.finalizeStrSql = `ALTER TABLE ${tableName} ADD PRIMARY KEY (${cols.join(
        ','
      )})`
      return this.executorApply
    }

    throw new Error('Invalid Index type!')
  }

  private get executorApply() {
    return {
      execute: async () =>
        await this.executor.apply(this, [this.finalizeStrSql]),
      sql: this.finalizeStrSql
    }
  }
}
