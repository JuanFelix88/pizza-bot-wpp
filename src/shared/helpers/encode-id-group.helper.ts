export function encodeIdGroup (server: string, user: string): string {
  return `${user}@${server}`
}
