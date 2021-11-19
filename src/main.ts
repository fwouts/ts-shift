import { writeFileSync } from "fs";
import path from "path";
import { generate } from "./lib/generator";
import { parse } from "./lib/parser";

const types = parse([path.join(__dirname, "..", "examples", "user.ts")]);
const generated = generate(types);
writeFileSync(
  path.join(__dirname, "..", "generated", "user.ts"),
  generated,
  "utf8"
);
