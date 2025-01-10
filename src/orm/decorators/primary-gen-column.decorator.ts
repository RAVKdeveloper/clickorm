import { AutoIncrementFunctions } from '../constants/db-functions.constants'
import { autoIncrementTypes } from '../constants/db-types.constants'
import { Global } from '../global'
import { MetaCol, MetadataKeys } from '../types/metadata.type'
import { typeAliasToDBType } from '../utils/common.utils'

export interface PrimaryGenerationColumnProps {
  readonly name?: string
}

export function PrimaryGenerationColumn(
  type: keyof typeof autoIncrementTypes,
  props?: PrimaryGenerationColumnProps
): PropertyDecorator {
  return function (target: any, propertyKey: string) {
    const dbType = typeAliasToDBType(type)

    const columns: MetaCol[] =
      Reflect.getMetadata(MetadataKeys.COL, target.constructor) ?? []

    const newColumn: MetaCol = {
      target: target,
      propertyKey: propertyKey,
      type: dbType,
      name: props?.name ?? propertyKey,
      primary: true,
      autoIncrement: type,
      default: AutoIncrementFunctions[type]
    }

    Global.indexes.push({
      target,
      type: 'primary',
      columns: [propertyKey]
    })

    columns.push(newColumn)

    Reflect.defineMetadata(MetadataKeys.COL, columns, target.constructor)
  }
}
