// 合并对象
export const mergeObj = (target: any, obj: any) =>
  Object.keys(target).map(key => obj?.[key] !== undefined && (target[key] = obj[key]))
// 判断对象类型
export const Type = {
  value: (obj: any) => Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1'),
  isNumber: (obj: any) => Type.value(obj) === 'Number',
  isString: (obj: any) => Type.value(obj) === 'String',
  isBoolean: (obj: any) => Type.value(obj) === 'Boolean',
  isSymbol: (obj: any) => Type.value(obj) === 'Symbol',
  isUndefined: (obj: any) => Type.value(obj) === 'Undefined',
  isNull: (obj: any) => Type.value(obj) === 'Null',
  isFunction: (obj: any) => Type.value(obj) === 'Function',
  isDate: (obj: any) => Type.value(obj) === 'Date',
  isArray: (obj: any) => Type.value(obj) === 'Array',
  isRegexp: (obj: any) => Type.value(obj) === 'Regexp',
  isError: (obj: any) => Type.value(obj) === 'Error',
  isHTMLDocument: (obj: any) => Type.value(obj) === 'HTMLDocument',
  isGlobal: (obj: any) => Type.value(obj) === 'global',
}
// 保证数的运算浮点精度
export const strip = (num: number, precision = 12) => +parseFloat(num.toPrecision(precision))
// 存储转换
export const kbToM = (kb: number) => kb > 1024 ? `${kb / 1024}M` : `${kb}Kb`