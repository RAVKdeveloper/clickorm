export const dbAllTypesArr = {
  // integer
  int1: 'int1',
  tinyint: 'tinyint',
  smallint: 'smallint',
  int2: 'int2',
  int: 'int',
  integer: 'integer',
  bigint: 'bigint',
  // unsigned integer
  uint8: 'uint8',
  uint16: 'uint16',
  uint32: 'uint32',
  uint64: 'uint64',
  // float
  float: 'float',
  double: 'double',
  // decimal
  decimal: 'decimal',
  boolean: 'boolean',
  // boolean
  bool: 'bool',
  // strings
  string: 'string',
  uuid: 'uuid',
  // date
  date: 'date',
  date32: 'date32',
  timestamp: 'timestamp',
  timestampz: 'timestampz',
  dateTime64: 'dateTime64',
  enum: 'enum'
}

export const aliasToType = {
  timestamp: 'date32',
  timestampz: 'DateTime',
  boolean: 'bool',
  number: 'int',
  string: 'String',
  uuid: 'UUID'
}

export const indexes = {
  primary: 'primary',
  secondary: 'secondary',
  trie: 'trie',
  bitmap: 'bitmap'
}

export const engines = {
  MergeTree: 'Merge Tree',
  Memory: 'Memory',
  TinyLog: 'TinyLog'
}

export const disableTypes = ['Object', 'Function', 'Array', 'Symbol']
export const typeWithRange = [
  dbAllTypesArr.decimal,
  aliasToType.timestampz,
  dbAllTypesArr.dateTime64,
  dbAllTypesArr.enum
]

export const DEFAULT_TIME_ZONE = 'Europe/Moscow'
export const DEFAULT_TIMESTAMP_PRECISION = 2
export const DEFAULT_PRECISION = 10
export const DEFAULT_SCALE = 2

export const autoIncrementTypes = {
  uuid: dbAllTypesArr.uuid
}

export const dbTypesToOrmTypes = {
  int64: 'bigint'
}
