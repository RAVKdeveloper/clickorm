export type RepositoryWhereData<T> = Partial<T>
export type RepositorySelectData<T> = Partial<{ [P in keyof T]: boolean }>
export type RepositoryOrderByData<T> = Partial<{
  [P in keyof T]: 'DESC' | 'ASC'
}>
export type RepositoryData<T> = Partial<T>

export interface Find<T> {
  where?: RepositoryWhereData<T>
  select?: RepositorySelectData<T>
  take?: number
  skip?: number
  orderBy?: RepositoryOrderByData<T>
  withSoftDelete?: boolean
}

export interface Delete<T> {
  where?: RepositoryWhereData<T>
}

export interface Create<T> {
  data: RepositoryData<T> | RepositoryData<T>[]
}

export interface Update<T> {
  data?: RepositoryData<T> | RepositoryData<T>[]
  where?: RepositoryWhereData<T>
}
