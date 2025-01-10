export interface CommonOrmLogger {
  info: (...messages: string[]) => void
  error: (...messages: string[]) => void
  warn: (...messages: string[]) => void
  query: (sql: string) => void
}
