import { QueryBuilder } from './query-builder'

export const Equal = (val: string | number) => {
  if (typeof val === 'string') {
    return `= '${val}'`
  }

  if (typeof val === 'number') {
    return `= ${val}`
  }

  throw new Error('Equal function, invalid input type!')
}

export const IsNull = () => {
  return 'IS NULL'
}

export const Not = (str: string) => {
  return `NOT ${str}`
}

export const Or = (...strings: string[]) => {
  return strings.join(' OR ')
}

export const LessThen = (val: number | string) => {
  if (typeof val === 'string') {
    return `< '${val}'`
  }

  if (typeof val === 'number') {
    return `< ${val}`
  }

  throw new Error('Equal function, invalid input type!')
}

export const GrassThen = (val: number | string) => {
  if (typeof val === 'string') {
    return `> '${val}'`
  }

  if (typeof val === 'number') {
    return `> ${val}`
  }

  throw new Error('Equal function, invalid input type!')
}

export const GrassThenOrEqual = (val: number | string) => {
  if (typeof val === 'string') {
    return `>= '${val}'`
  }

  if (typeof val === 'number') {
    return `>= ${val}`
  }

  throw new Error('Equal function, invalid input type!')
}

export const LessThenOrEqual = (val: number | string) => {
  if (typeof val === 'string') {
    return `<= '${val}'`
  }

  if (typeof val === 'number') {
    return `<= ${val}`
  }

  throw new Error('Equal function, invalid input type!')
}

export const In = (...values: any[]) => {
  return `IN(${values.join(',')})`
}

export const SubQuery = (sql: string | ReturnType<QueryBuilder['select']>) => {
  if (typeof sql === 'string') {
    return sql
  } else {
    return sql.sql
  }
}

export const Like = (str: string) => {
  return `LIKE '${str}'`
}

export const IsNotNull = () => Not(IsNull())
