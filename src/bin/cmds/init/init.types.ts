export interface InitCmdArgsInterface {
  dataSource: string
  extension?: string
  entities?: string
  port?: number
  host?: string
  username?: string
  password?: string
  database?: string
  migrationsTable?: string
  sync: boolean
  migrationsDir: string
}
