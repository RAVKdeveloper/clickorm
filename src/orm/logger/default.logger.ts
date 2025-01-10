import chalk from 'chalk'
import { CommonOrmLogger } from './logger.interface'

export class OrmLogger implements CommonOrmLogger {
  public info(...messages: string[]): void {
    console.log(chalk.green(...messages))
  }

  public error(...messages: string[]): void {
    console.error(chalk.red(...messages))
  }

  public warn(...messages: string[]): void {
    console.warn(chalk.yellow(...messages))
  }

  public query(sql: string): void {
    console.log(chalk.blue(sql))
  }
}
