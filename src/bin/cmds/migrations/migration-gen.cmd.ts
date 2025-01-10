import path from 'path'
import yargs from 'yargs'
import { DataSource } from '../../../orm/data-source/data-source'
import { CommandUtils } from '../../utils/cmd.utils'
import { OrmLogger } from '../../../orm/logger/default.logger'

export class MigrationGenerateCmd implements yargs.CommandModule {
  command = 'migration:generate <name>'
  describe =
    'Generates a new migration file with sql needs to be executed to update schema.'

  public builder(args: yargs.Argv) {
    return args
      .positional('name', {
        type: 'string',
        describe: 'Name of the migration file',
        demandOption: true
      })
      .option('dataSource', {
        alias: 'd',
        type: 'string',
        describe: 'Path to the file where your DataSource instance is defined.',
        demandOption: true
      })
      .option('o', {
        alias: 'outputJs',
        type: 'boolean',
        default: false,
        describe:
          'Generate a migration file on Javascript instead of Typescript'
      })
      .option('t', {
        alias: 'timestamp',
        type: 'number',
        default: false,
        describe: 'Custom timestamp for the migration name'
      })
  }

  public async handler(args: yargs.Arguments<any & { path: string }>) {
    let dataSource: DataSource | undefined = undefined
    const logger = new OrmLogger()
    try {
      dataSource = await CommandUtils.loadDataSource(
        path.resolve(process.cwd(), args.dataSource as string)
      )
      dataSource.setOptions({
        sync: false
      })

      const migrationRunner = dataSource.migrationRunner

      try {
        const opt: Record<string, any> = {}

        if (args.timestamp) {
          opt.setTimestamp = args.timestamp
        }

        if (args.outputJs) {
          opt.outputPath = args.outputJs
        }

        await migrationRunner.createMigration(args.name, opt)
      } catch (e) {
        throw e
      } finally {
        process.exit(1)
      }
    } catch (err) {
      logger.error(`Error on during migration file!\nDetails: ${err}`)
      process.exit(1)
    }
  }
}
