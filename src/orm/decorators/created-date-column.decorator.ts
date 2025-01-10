import {
  AutoIncrementFunctions,
  DateDbFunctions
} from '../constants/db-functions.constants'
import { DEFAULT_TIME_ZONE, aliasToType } from '../constants/db-types.constants'
import { MetaCol, MetadataKeys } from '../types/metadata.type'

export interface CreatedDateColumnProps {
  name?: string
  timezone?: string
}

export function CreatedDateColumn(
  props?: CreatedDateColumnProps
): PropertyDecorator {
  return function (target: any, propertyKey: string) {
    const dbType = aliasToType.timestampz

    const columns: MetaCol[] =
      Reflect.getMetadata(MetadataKeys.COL, target.constructor) ?? []

    const newColumn: MetaCol = {
      target: target,
      propertyKey,
      type: dbType,
      name: props?.name ?? propertyKey,
      timezone: props?.timezone ?? DEFAULT_TIME_ZONE,
      default: DateDbFunctions.now
    }

    columns.push(newColumn)

    Reflect.defineMetadata(MetadataKeys.COL, columns, target.constructor)
  }
}
