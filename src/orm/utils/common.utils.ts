import { aliasToType, disableTypes } from '../constants/db-types.constants'
import { MetaCol } from '../types/metadata.type'

export const typeAliasToDBType = (type: string) => {
  if (disableTypes.includes(type)) {
    throw new Error(
      `Received disabled type! Disabled types: ${disableTypes.join(', ')}`
    )
  }

  const val = aliasToType[type.toLowerCase()] as string | undefined

  if (!val) {
    return type
  }

  return val
}

export const objectColumnsToDbKeys = (
  target: Record<string, any>,
  expect: MetaCol[]
): Record<string, any> => {
  const result: Record<string, any> = {}

  Object.entries(target).forEach(([k, v]) => {
    const dnName = expect.find((col) => col.propertyKey === k)

    if (!dnName) {
      throw new Error(`Missing column! Received ${k}`)
    }

    result[dnName.name] = v
  })

  return result
}
