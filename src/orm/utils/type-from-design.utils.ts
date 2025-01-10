import 'reflect-metadata'

export const typeFromDesign = (target: any, propertyName: string) => {
  return Reflect.getMetadata('design:type', target, propertyName).name
}
