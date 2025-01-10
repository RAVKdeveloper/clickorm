import * as glob from 'glob'
import { PathUtils } from './path.utils'
import { importOrRequireFile } from './import.utils'
import { ObjectUtils } from './object.utils'
import { LoadChecker } from './load-checker.utils'

export async function importClassesFromDirectories(
  directories: string[],
  formats = ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts']
): Promise<Function[]> {
  function loadFileClasses(exported: any, allLoaded: Function[]) {
    if (LoadChecker.isEntity(exported)) {
      allLoaded.push(exported)
    } else if (Array.isArray(exported)) {
      exported.forEach((i: any) => loadFileClasses(i, allLoaded))
    } else if (ObjectUtils.isObject(exported)) {
      Object.keys(exported).forEach((key) =>
        loadFileClasses(exported[key], allLoaded)
      )
    }
    return allLoaded
  }

  const allFiles = directories.reduce((allDirs, dir) => {
    return allDirs.concat(glob.sync(PathUtils.pathNormalize(dir)))
  }, [] as string[])

  const dirPromises = allFiles
    .filter((file) => {
      const dtsExtension = file.substring(file.length - 5, file.length)
      return (
        formats.indexOf(PathUtils.pathExtname(file)) !== -1 &&
        dtsExtension !== '.d.ts'
      )
    })
    .map(async (file) => {
      const [importOrRequireResult] = await importOrRequireFile(
        PathUtils.pathResolve(file)
      )
      return importOrRequireResult
    })

  const dirs = await Promise.all(dirPromises)

  return loadFileClasses(dirs, [])
}

export function importJsonsFromDirectories(
  directories: string[],
  format = '.json'
): any[] {
  const allFiles = directories.reduce((allDirs, dir) => {
    return allDirs.concat(glob.sync(PathUtils.pathNormalize(dir)))
  }, [] as string[])

  return allFiles
    .filter((file) => PathUtils.pathExtname(file) === format)
    .map((file) => require(PathUtils.pathResolve(file)))
}
