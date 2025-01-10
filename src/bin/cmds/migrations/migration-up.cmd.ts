import path from 'path'
import yargs from 'yargs'
import { DataSource } from '../../../orm/data-source/data-source'
import { CommandUtils } from '../../utils/cmd.utils'
import { OrmLogger } from '../../../orm/logger/default.logger'

export class MigrationRunCmd implements yargs.CommandModule {
  command = 'migration:run'
  describe =
    'Run migrations file with sql needs to be executed to update schema.'

  public builder(args: yargs.Argv) {
    return args.option('dataSource', {
      alias: 'd',
      type: 'string',
      describe: 'Path to the file where your DataSource instance is defined.',
      demandOption: true
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
        await migrationRunner.run(dataSource)
      } catch (e) {
        logger.error(e.message)
        process.exit(1)
      } finally {
        process.exit(1)
      }
    } catch (err) {
      logger.error(`Error on run migration file!\nDetails: ${err}`)
      process.exit(1)
    }
  }
}
