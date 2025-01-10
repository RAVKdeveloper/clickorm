import { MigrationClass } from '../types/migration.type'

export const getMigrations = (data: Array<Array<any>>) => {
  const migrationsArr: MigrationClass[] = []

  data.forEach((d) => {
    if (d.length === 0) {
      return
    }

    if (d.length !== 1) {
      throw new Error('Must be 1 export from migration file!')
    }

    d.forEach((m) => {
      const keys = Object.keys(m)

      if (keys.length !== 1) {
        throw new Error('Must be 1 export from migration file!')
      }

      const migration = m[keys[0]]

      if (typeof migration !== 'function') {
        throw new Error(
          `Expect Migration Class, received ${typeof migration}! ${m[keys[0]]}`
        )
      }

      migrationsArr.push(migration)
    })
  })

  return migrationsArr
}
