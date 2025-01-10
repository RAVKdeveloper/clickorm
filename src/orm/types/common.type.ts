import { MetaCol } from './metadata.type'

export interface CreateTableColumn
  extends Omit<MetaCol, 'target' | 'propertyKey'> {}

export type Class = new () => {}

export type QueryPartialEntity<T> = {
  [P in keyof T]?: T[P] | (() => string)
}

export interface ObjectLiteral {
  [key: string]: any
}

export type QueryDeepPartialEntity<T> = _QueryDeepPartialEntity<
  ObjectLiteral extends T ? unknown : T
>

type _QueryDeepPartialEntity<T> = {
  [P in keyof T]?:
    | (T[P] extends Array<infer U>
        ? Array<_QueryDeepPartialEntity<U>>
        : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<_QueryDeepPartialEntity<U>>
        : _QueryDeepPartialEntity<T[P]>)
    | (() => string)
}

export type EntityTarget<T> = new () => T
