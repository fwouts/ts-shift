import cac from "cac";
import chalk from "chalk";
import { writeFileSync } from "fs";
import path from "path";
import { generate } from "./lib/generator";
import { parse } from "./lib/parser";

const cli = cac("ts-shift");

cli
  .command("<entry>") // default command
  .alias("generate")
  .option("-o, --output <path>", "Output path of the generated module")
  .action(
    async (
      entry: string,
      options: {
        o?: string;
      }
    ) => {
      const types = parse([path.resolve(entry)]);
      const generated = generate(types);
      if (options.o) {
        writeFileSync(path.resolve(options.o), generated, "utf8");
        console.log(`${chalk.green("Generated:")} ${options.o}`);
      } else {
        console.log(generated);
      }
    }
  );

cli.help();
cli.version(require("../package.json").version);

cli.parse();
