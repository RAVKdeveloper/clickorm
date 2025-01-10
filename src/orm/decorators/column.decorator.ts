import { dbAllTypesArr } from '../constants/db-types.constants'
import { Global } from '../global'
import { MetaCol, MetadataKeys } from '../types/metadata.type'
import { typeAliasToDBType } from '../utils/common.utils'
import { typeFromDesign } from '../utils/type-from-design.utils'

export interface ColumnProps {
  type?: keyof typeof dbAllTypesArr
  name?: string
  primary?: boolean
  enum?: Record<string, any>
  scale?: number
  precision?: number
  default?: any
  timezone?: string
  nullable?: boolean
}

export function Column(props?: ColumnProps): PropertyDecorator {
  return function (target: any, propertyName: string) {
    const receivedType = props?.type ?? typeFromDesign(target, propertyName)
    const dbType = typeAliasToDBType(receivedType)

    const columns: MetaCol[] =
      Reflect.getMetadata(MetadataKeys.COL, target.constructor) ?? []

    const newColumn: MetaCol = {
      target: target,
      propertyKey: propertyName,
      type: dbType,
      name: props?.name ?? propertyName
    }

    if (props?.enum) {
      newColumn.enum = props.enum
    }

    if (props?.primary) {
      newColumn.primary = props.primary

      Global.indexes.push({
        target,
        type: 'primary',
        columns: [propertyName]
      })
    }

    if (props?.scale) {
      newColumn.scale = props.scale
    }

    if (props?.precision) {
      newColumn.precision = props.precision
    }

    if (props?.default !== undefined) {
      newColumn.default = props.default
    }

    if (props?.timezone) {
      newColumn.timezone = props.timezone
    }

    if (props?.nullable) {
      newColumn.nullable = props.nullable
    }

    columns.push(newColumn)

    Reflect.defineMetadata(MetadataKeys.COL, columns, target.constructor)
  }
}
