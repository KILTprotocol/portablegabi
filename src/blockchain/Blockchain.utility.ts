export function uint8ArrToString(buf: number[] | ArrayBuffer): string {
  return String.fromCharCode(...new Uint8Array(buf))
}

export function strToUint8Arr(str: string): Uint8Array {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i += 1) {
    bufView[i] = str.charCodeAt(i)
  }
  return bufView
}
