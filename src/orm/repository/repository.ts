import { Connection } from '../connection/connection'
import { QueryBuilder } from '../query-builder'
import { EntityTarget } from '../types/common.type'
import { Create, Delete, Find, Update } from '../types/repository.type'
import { transformRepoWhereToQueryBuilderWhere } from './utils'

export class Repository<T> {
  constructor(
    private readonly connection: Connection,
    private readonly Entity: EntityTarget<T>
  ) {}

  public async findMany(props?: Find<T>) {
    const queryBuilder = new QueryBuilder(this.connection)

    const builder = queryBuilder
      .select()
      .from(this.Entity)
      .columns(props?.select ? Object.keys(props.select) : '*')

    if (props?.where) {
      const where = transformRepoWhereToQueryBuilderWhere<T>(props?.where)
      builder.where(where)
    }

    if (props?.skip) {
      builder.skip(props?.skip)
    }

    if (props?.take) {
      builder.take(props?.take)
    }

    if (props?.orderBy) {
      Object.entries(props?.orderBy).forEach(([k, v]) => {
        builder.orderBy(k, v as 'ASC' | 'DESC')
      })
    }

    return await builder.getMany()
  }

  public async findOne(props?: Find<T>) {
    const queryBuilder = new QueryBuilder(this.connection)

    const builder = queryBuilder
      .select()
      .from(this.Entity)
      .columns(props?.select ? Object.keys(props.select) : '*')

    if (props?.where) {
      const where = transformRepoWhereToQueryBuilderWhere<T>(props?.where)
      builder.where(where)
    }

    if (props?.skip) {
      builder.skip(props?.skip)
    }

    if (props?.take) {
      builder.take(props?.take)
    }

    if (props?.orderBy) {
      Object.entries(props?.orderBy).forEach(([k, v]) => {
        builder.orderBy(k, v as 'ASC' | 'DESC')
      })
    }

    return await builder.getOne()
  }

  public async delete(props?: Delete<T>) {
    const queryBuilder = new QueryBuilder(this.connection)

    const builder = queryBuilder.delete().from(this.Entity)

    if (props?.where) {
      const where = transformRepoWhereToQueryBuilderWhere<T>(props?.where)
      builder.where(where)
    }

    return await builder.execute()
  }

  public async create(props: Create<T>) {
    const queryBuilder = new QueryBuilder(this.connection)

    const builder = queryBuilder.insert().into(this.Entity).values(props.data)

    return await builder.execute()
  }

  public async update(props: Update<T>) {
    const queryBuilder = new QueryBuilder(this.connection)

    const builder = queryBuilder.update().from(this.Entity)

    if (props?.data) {
      builder.set(props.data)
    }

    if (props?.where) {
      const where = transformRepoWhereToQueryBuilderWhere<T>(props?.where)
      builder.where(where)
    }

    return await builder.execute()
  }

  public createQueryBuilder() {
    return new QueryBuilder(this.connection)
  }
}
