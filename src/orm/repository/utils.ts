import { WhereConditions } from '../types/query-builder.type'

export const transformRepoWhereToQueryBuilderWhere = <T>(
  data: Partial<T>
): WhereConditions<T>[] => {
  return Object.entries(data).map(([k, v]) => ({
    column: k as keyof T,
    expr: v as string
  }))
}
