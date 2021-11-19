import path from "path";
import { generate } from "./lib/generator";
import { parse } from "./lib/parser";

const types = parse([path.join(__dirname, "..", "examples", "user.ts")]);
const generated = generate(types);
console.log(generated);
