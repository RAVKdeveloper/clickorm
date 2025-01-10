import { DataSource } from '../data-source/data-source'

export class LoadChecker {
  public static isEntity(target: any): boolean {
    if (typeof target === 'object' && target?.constructor) {
      return true
    }

    return false
  }

  public static isDataSource(obj: unknown): obj is DataSource {
    return this.check(obj, 'DataSource')
  }

  private static check(obj: unknown, name: string) {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      (obj as { '@instanceof': Symbol })['@instanceof'] === Symbol.for(name)
    )
  }
}
