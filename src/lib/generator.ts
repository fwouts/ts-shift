import assertNever from "assert-never";
import prettier from "prettier";
import { Type } from "./types";

export function generate(types: Record<string, Type>) {
  // TODO: Don't use inspect for browser compatibility.
  const unformatted =
    `
  import { inspect } from 'util';

  function fail(message: string, value: unknown): never {
    throw new Error(message + ':\\n' + inspect(value));
  }

  export type Type<T> = {
    sanitize(value: unknown): T;
  }
  ` +
    Object.entries(types)
      .map(
        ([name, type]) => `
        export type ${name} = ${generateTypeDeclaration(type)};

        export const ${name}: Type<${name}> = {
          sanitize(__value__: unknown): ${name} {
            return ${generateTypeSanitizer(type, "__value__", [name])}
          }
        };
        `
      )
      .join("\n");
  return prettier.format(unformatted, {
    parser: "babel-ts",
  });
}

function generateTypeDeclaration(type: Type): string {
  switch (type.kind) {
    case "alias":
      return `${type.name}`;
    case "number":
      return `number`;
    case "object":
      return `
      {
        ${Object.entries(type.properties)
          .map(
            ([name, property]) =>
              `${name}${
                property.required ? "" : "?"
              }: ${generateTypeDeclaration(property.type)}`
          )
          .join(";")}
      }`;
    case "string":
      return `string`;
    default:
      throw assertNever(type);
  }
}

function generateTypeSanitizer(
  type: Type,
  value: string,
  path: string[]
): string {
  switch (type.kind) {
    case "alias":
      return `${type.name}.sanitize(${value})`;
    case "number":
      return `typeof(${value}) === 'number' ? ${value} : fail("${path.join(
        "."
      )} is not a number", ${value})`;
    case "object":
      const localName = variableNameFromPath(path);
      return `typeof(${value}) === 'object' && ${value} !== null
        ? (() => {
          const ${localName} = ${value} as any;
          return Object.fromEntries([
            ${Object.entries(type.properties)
              .map(([name, property]) => {
                const propertyAccessor = `${localName}["${name}"]`;
                let subtypeSanitizer = generateTypeSanitizer(
                  property.type,
                  propertyAccessor,
                  [...path, name]
                );
                if (!property.required) {
                  subtypeSanitizer = `${value} === undefined || (${subtypeSanitizer})`;
                }
                return `["${name}", ${subtypeSanitizer}]`;
              })
              .join(",")}
          ])
        })()
        : fail("${path.join(".")} is not an object", ${value})`;
    case "string":
      return `typeof(${value}) === 'string' ?  ${value} : fail("${path.join(
        "."
      )} is not a string", ${value})`;
    default:
      throw assertNever(type);
  }
}

function variableNameFromPath(path: string[]) {
  const name = path.join("_");
  return name.charAt(0).toLowerCase() + name.slice(1);
}
