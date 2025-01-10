import { autoIncrementTypes } from './db-types.constants'

export const AutoIncrementFunctions = {
  [autoIncrementTypes.uuid]: 'generateUUIDv4()'
}

export const DateDbFunctions = {
  now: 'now()'
}
