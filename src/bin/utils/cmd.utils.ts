import { importOrRequireFile } from '../../orm/utils/import.utils'
import { DataSource } from '../../orm/data-source/data-source'
import { LoadChecker } from '../../orm/utils/load-checker.utils'

export class CommandUtils {
  public static async loadDataSource(
    dataSourceFilePath: string
  ): Promise<DataSource> {
    let dataSourceFileExports
    try {
      ;[dataSourceFileExports] = await importOrRequireFile(dataSourceFilePath)
    } catch (err) {
      throw new Error(
        `Unable to open file: "${dataSourceFilePath}". ${err.message}`
      )
    }

    if (!dataSourceFileExports || typeof dataSourceFileExports !== 'object') {
      throw new Error(
        `Given data source file must contain export of a DataSource instance`
      )
    }

    if (LoadChecker.isDataSource(dataSourceFileExports)) {
      return dataSourceFileExports
    }

    const dataSourceExports: DataSource[] = []
    for (const fileExportKey in dataSourceFileExports) {
      const fileExport = dataSourceFileExports[fileExportKey]
      const awaitedFileExport = await fileExport
      if (LoadChecker.isDataSource(awaitedFileExport)) {
        dataSourceExports.push(awaitedFileExport)
      }
    }

    if (dataSourceExports.length === 0) {
      throw new Error(
        `Given data source file must contain export of a DataSource instance`
      )
    }
    if (dataSourceExports.length > 1) {
      throw new Error(
        `Given data source file must contain only one export of DataSource instance`
      )
    }

    return dataSourceExports[0]
  }
}
