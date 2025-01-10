import { Global } from '../global'
import { engines } from '../constants/db-types.constants'

export interface EntityProps {
  name?: string
  engine?: keyof typeof engines
}

export function Entity(props?: EntityProps): ClassDecorator {
  return function (target: any) {
    Global.entities.push({
      target,
      name: target.name,
      engine: props?.engine ?? 'MergeTree',
      tableName: props?.name ?? target.name
    })
  }
}
