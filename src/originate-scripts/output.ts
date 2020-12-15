/**
 * Display informational messages for the user to see. Messages are written to
 * stderr. The message may be formatted using chalk.
 */
export function info(message: string) {
  process.stderr.write(message + "\n", "utf8");
}
