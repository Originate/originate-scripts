import chalk from "chalk";

export function emphasized(content: string): string {
  return chalk.cyanBright.bold(content);
}

export function deemphasized(content: string): string {
  return chalk.greenBright(content);
}
