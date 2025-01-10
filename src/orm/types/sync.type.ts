export interface DbColumn {
  name: string
  type: string
  default_type: string
  default_expression: string
  comment: string
  codec_expression: string
  ttl_expression: string
}

export interface DdIndex {
  table: string
  non_unique: 1 | 0
  key_name: 'PRIMARY'
  seq_in_index: string
  column_name: string
  collation: string
  cardinality: string
  sub_part: null
  packed: null
  null: null
  index_type: 'PRIMARY'
  comment: string
  index_comment: string
  visible: 'YES' | 'NO'
  expression: string
}
