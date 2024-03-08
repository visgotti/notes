export const removeItemFromArray = (array: Array<any>, object: any, identifier?: any) => {
  if(identifier) {
    return array.filter(a => a[identifier] !== object[identifier]);
  } else {
    return array.filter(a => a !== object);
  }
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

export function getErrorMessage(error: unknown, opts?: { log?: boolean, prefix?: string }) {
  let messageString = (() => {
    if (isErrorWithMessage(error)) return error.message
    try {
      return new Error(JSON.stringify(error)).message
    } catch {
      return new Error(String(error)).message
    }
  })();
  if(opts?.prefix) {
    messageString = `${opts.prefix} ${messageString}`
  }
  if(opts?.log) {
    console.error(messageString);
  }
  return messageString;
}