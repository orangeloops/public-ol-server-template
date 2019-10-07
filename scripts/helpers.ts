import {ExecOptions} from "child_process";
import * as spawn from "cross-spawn";
import * as path from "path";

export const projectPath = path.join(__dirname, "..");

export type Command = string | [string, string[]];
export const runCommand = (command: Command, options?: ExecOptions): Promise<number> =>
  new Promise((resolve, reject) => {
    console.log(`Running \`${typeof command === "string" ? command : `${command[0]} ${command[1].join(" ")}`}\``);

    const execCommand = typeof command === "string" ? spawn(command, undefined, options) : spawn(command[0], command[1], options);

    if (execCommand.stdout) execCommand.stdout.pipe(process.stdout);
    execCommand.on("error", reject).on("exit", code => resolve(code || 0));
  });
