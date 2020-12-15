import { ChildProcessByStdio, spawn, SpawnOptions } from "child_process";
import { deemphasized } from "./formatting";
import { info } from "./output";

export async function shellCommand(
  command: string,
  args: string[] = [],
  options?: SpawnOptions
): Promise<number> {
  info(deemphasized(`$ ${command} ${args.join(" ")}`));
  const childProcess = spawn(command, args, {
    stdio: [process.stdin, process.stdout, process.stderr],
    ...options,
  });
  return onExit(childProcess);
}

// Waits for a child process to exit, and resolves with its exit status.
function onExit(
  childProcess: ChildProcessByStdio<any, any, any>
): Promise<number> {
  return new Promise((resolve, reject) => {
    childProcess.on("close", resolve);
    childProcess.on("error", reject);
  });
}
