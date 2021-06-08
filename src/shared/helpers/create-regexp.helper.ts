export function createRegexp (regexp: string, flags: string[] = []): RegExp {
  // eslint-disable-next-line no-new-func
  return new Function(`return /${regexp}/${flags.join('')}`)()
}
