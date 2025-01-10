import {
  DEFAULT_PRECISION,
  DEFAULT_SCALE,
  DEFAULT_TIMESTAMP_PRECISION,
  DEFAULT_TIME_ZONE,
  aliasToType,
  dbAllTypesArr,
  typeWithRange
} from '../constants/db-types.constants'
import { CreateTableColumn } from '../types/common.type'
import { MetaCol } from '../types/metadata.type'

export class ColumnBuilder {
  public static buildColumnsWithBraces(cols: CreateTableColumn[]) {
    const startBraces = '('
    const endBraces = ')'
    let columnsSql: string[] = []

    for (const col of cols) {
      const sql = new ColumnBuilder(col as MetaCol).generateSql()
      columnsSql.push(sql)
    }

    const finalizeStringSql = `${startBraces}${columnsSql.join(
      `, `
    )}${endBraces}`

    return finalizeStringSql
  }

  constructor(private readonly data: MetaCol) {}

  public generateSql() {
    const sql = `${
      this.data.name
    } ${this.getType()}${this.getDefault()}${this.isPrimaryCol()}`

    return sql
  }

  public get metadata() {
    return this.data
  }

  private isPrimaryCol() {
    return this.data.primary ? ` PRIMARY KEY` : ''
  }

  public getDefault() {
    if (this.data.default !== undefined) {
      return ` DEFAULT ${this.data.default}`
    }

    return ''
  }

  public getType() {
    let type = this.data.type

    if (this.data.nullable) {
      type = `Nullable(${type})`
    }

    return `${type}${this.isRangeType()}`
  }

  private isRangeType() {
    if (typeWithRange.includes(this.data.type)) {
      if (this.data.type === dbAllTypesArr.decimal) {
        return `(${this.data.precision ?? DEFAULT_PRECISION}, ${
          this.data.scale ?? DEFAULT_SCALE
        })`
      } else if (this.data.type === aliasToType.timestampz) {
        return `('${this.data.timezone ?? DEFAULT_TIME_ZONE}')`
      } else if (this.data.type === dbAllTypesArr.dateTime64) {
        return `(${this.data.precision ?? DEFAULT_TIMESTAMP_PRECISION}, ${
          this.data.timezone ?? DEFAULT_TIME_ZONE
        })`
      }
    }

    return ''
  }
}
