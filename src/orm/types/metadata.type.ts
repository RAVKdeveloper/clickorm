import { autoIncrementTypes } from '../constants/db-types.constants'

export enum MetadataKeys {
  COL = 'COLUMN'
}

export interface MetaCol {
  target: any
  propertyKey: string
  type: string
  name: string
  enum?: Record<string, any>
  primary?: boolean
  scale?: number
  precision?: number
  default?: any
  timezone?: string
  nullable?: boolean
  autoIncrement?: keyof typeof autoIncrementTypes
}
