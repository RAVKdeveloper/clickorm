import { Connection } from '../connection/connection'

export class TransactionManager {
  public isCommit: boolean = false
  public isRollback: boolean = false
  public isStartTx: boolean = false

  constructor(private readonly connection: Connection) {}

  public async beginTransaction() {
    try {
      const data = await this.connection.query('BEGIN TRANSACTION')
      this.isStartTx = true
      return data
    } catch {
      throw new Error(
        'You ClickHouse configuration not supported transactions! Please change you config'
      )
    }
  }

  public async query(sql: string) {
    return await this.connection.query(sql)
  }

  public async insert(table: string, values: Record<string, any>[]) {
    return await this.connection.insert(table, values)
  }

  public async commit() {
    const data = await this.connection.query('COMMIT')
    this.isCommit = true
    return data
  }

  public async rollback() {
    const data = await this.connection.query('ROLLBACK')
    this.isRollback = true
    return data
  }
}
