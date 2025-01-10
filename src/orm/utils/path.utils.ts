import path from 'path'

export class PathUtils {
  static pathNormalize(pathStr: string): string {
    let normalizedPath = path.normalize(pathStr)
    if (process.platform === 'win32')
      normalizedPath = normalizedPath.replace(/\\/g, '/')
    return normalizedPath
  }

  static pathExtname(pathStr: string): string {
    return path.extname(pathStr)
  }

  static pathResolve(pathStr: string): string {
    return path.resolve(pathStr)
  }
}
