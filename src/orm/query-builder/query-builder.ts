import { Connection } from '../connection/connection'
import { OrmLogger } from '../logger/default.logger'
import { isLogging } from '../utils/isLogging.utils'
import { CreateCmdScopeBuilder } from './create-scope.builder'
import { DeleteScopeBuilder } from './delete-scope.builder'
import { DropCmdScopBuilder } from './drop-scope.builder'
import { InsertScopeBuilder } from './insert-scope.builder'
import { SelectScopeBuilder } from './select-scope.builder'
import { UpdateScopeBuilder } from './update-scope.builder'

export class QueryBuilder {
  private readonly logger = new OrmLogger()

  constructor(private readonly connection: Connection) {}

  public create() {
    const cmds = new CreateCmdScopeBuilder(this.executor, this.connection)

    return cmds
  }

  public drop() {
    const cmds = new DropCmdScopBuilder(this.executor, this.connection)

    return cmds
  }

  public insert() {
    const cmds = new InsertScopeBuilder(this.insertExecutor, this.connection)

    return cmds
  }

  public select() {
    const cmds = new SelectScopeBuilder(this.executor, this.connection)

    return cmds
  }

  public delete() {
    const cmds = new DeleteScopeBuilder(this.connection)

    return cmds
  }

  public update() {
    const cmds = new UpdateScopeBuilder(this.executor, this.connection)

    return cmds
  }

  public async query(sql: string) {
    if (isLogging()) {
      this.logger.query(sql)
    }
    return await this.executor(sql)
  }

  private async executor(str: string): Promise<any> {
    return await this.connection.query(str)
  }

  private async insertExecutor(
    tableName: string,
    values: Record<string, any>[]
  ): Promise<any> {
    return await this.connection.insert(tableName, values)
  }
}
