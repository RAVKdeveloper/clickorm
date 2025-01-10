import path from 'path'
import yargs from 'yargs'
import fs from 'fs'
import { DataSource } from '../../../orm/data-source/data-source'
import { DEFAULT_DATA_SOURCE_NAME } from '../../../orm/constants/default.constants'
import { InitCmdArgsInterface } from './init.types'
import { OrmLogger } from '../../../orm/logger/default.logger'

export class InitCmd implements yargs.CommandModule {
  command = 'init'
  describe = 'Initialization new data source'

  public builder(args: yargs.Argv) {
    return args
      .option('dataSource', {
        alias: 'd',
        type: 'string',
        default: `${process.cwd()}/${DEFAULT_DATA_SOURCE_NAME}`,
        describe: 'Path to the file where your DataSource instance is defined.',
        demandOption: true
      })
      .option('extension', {
        alias: 'ext',
        type: 'string',
        default: 'js',
        describe: 'Typescript or JavaScript extension file(js or ts)'
      })
      .option('entities', {
        alias: 'entities',
        type: 'string',
        describe: 'Entities path'
      })
      .option('migrationsDir', {
        alias: 'migrationsDir',
        type: 'string',
        default: `${process.cwd()}/migrations`,
        describe: 'Migrations path'
      })
      .option('port', {
        alias: 'port',
        type: 'number',
        describe: 'Database port'
      })
      .option('host', {
        alias: 'host',
        type: 'string',
        describe: 'Database host'
      })
      .option('username', {
        alias: 'username',
        type: 'string',
        describe: 'Database user username'
      })
      .option('password', {
        alias: 'password',
        type: 'string',
        describe: 'Database user password'
      })
      .option('database', {
        alias: 'database',
        type: 'string',
        describe: 'Database name'
      })
      .option('migrationsTable', {
        alias: 'migrationsTable',
        type: 'string',
        describe: 'Database migrations table name'
      })
      .option('sync', {
        alias: 'sync',
        type: 'boolean',
        default: false,
        describe: 'Synchronize database schema'
      })
  }

  public async handler(args: yargs.Arguments<InitCmdArgsInterface>) {
    const logger = new OrmLogger()
    try {
      const opt: Partial<DataSource['opt']> = {}

      if (args.entities) {
        opt.entities = [args.entities]
      }

      if (args.host) {
        opt.host = args.host
      }

      if (args.migrationsTable) {
        opt.migrationsTable = args.migrationsTable
      }

      if (args.migrationsDir) {
        opt.migrationsDir = args.migrationsDir
      }

      if (args.port) {
        opt.port = args.port
      }

      if (args.username) {
        opt.username = args.username
      }

      if (args.password) {
        opt.password = args.password
      }

      if (args.sync) {
        opt.sync = args.sync
      }

      if (args.database) {
        opt.database = args.database
      }

      const allowExt = ['ts', 'js']
      let extension: string = '.js'
      const templates = {
        js: InitCmd.getJsTemplate,
        ts: InitCmd.getTsTemplate
      }
      let template = InitCmd.getJsTemplate(opt)

      if (args.extension && allowExt.includes(args.extension)) {
        template = templates[args.extension](opt)
        extension = '.' + args.extension
      }

      if (
        args.dataSource.endsWith(allowExt[0]) ||
        args.dataSource.endsWith(allowExt[1])
      ) {
        template =
          templates[args.dataSource.substring(args.dataSource.length - 2)](opt)
        extension = ''
      }

      const pathToConfig = path.resolve(`${args.dataSource}${extension}`)
      fs.writeFileSync(pathToConfig, template, { encoding: 'utf-8' })

      logger.info(
        `Successful initialization data source! Path: ${pathToConfig}`
      )

      process.exit(1)
    } catch (e) {
      logger.error(`Error on init data source!\nDetails: ${e.message}`)
      process.exit(1)
    }
  }

  protected static getJsTemplate(opt: Partial<DataSource['opt']>) {
    return `
const { DataSource } = require('clickorm')   

const dataSource = DataSource.init(${JSON.stringify(opt)})

module.exports = { dataSource }
`
  }

  protected static getTsTemplate(opt: Partial<DataSource['opt']>) {
    return `
import { DataSource } from 'clickorm' 
    
export const dataSource = DataSource.init(${JSON.stringify(opt)})    
`
  }
}
