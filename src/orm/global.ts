import { engines, indexes } from './constants/db-types.constants'

export interface Index {
  target: any
  columns: string[]
  type: keyof typeof indexes
}

export interface Entity {
  target: any
  name: string
  engine: keyof typeof engines
  tableName: string
}

export class Global {
  public static entities: Entity[] = []
  public static indexes: Index[] = []
  public static isLogging: boolean = false

  constructor() {
    throw new Error('Global class not instance!')
  }
}
