import { join } from 'path'
import { importClassesFromDirectories } from './load-entities.utils'
import { DataSource } from '../data-source/data-source'

export const getDataSource = async (path: string[]): Promise<DataSource> => {
  const configPath = join(...path)

  const importData = await importClassesFromDirectories([configPath])

  const object = importData[0][0]

  if (!object) {
    throw new Error('Not found DataSource!')
  }

  const keys = Object.keys(object)

  if (keys.length !== 1) {
    throw new Error('DataSource file must be one export object!')
  }

  const getFunction: Promise<DataSource> = object[keys[0]]

  if (!(getFunction instanceof Promise)) {
    throw new Error('Must be object type export!')
  }

  const source = await getFunction

  return source
}
