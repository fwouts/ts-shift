import assertNever from "assert-never";
import prettier from "prettier";
import { Type } from "./types";

export function generate(types: Record<string, Type>) {
  // TODO: Don't use inspect for browser compatibility.
  const unformatted =
    `
  import { inspect } from 'util';

  function fail(message: string, value: unknown): never {
    throw new ValidationError(message + ':\\n' + inspect(value));
  }

  export class ValidationError extends Error {
    constructor(message: string) {
      super(message);
    }
  }

  export function createErrorCatcher(): ErrorCatcher {
    return {
      error: ''
    }
  }

  export interface ErrorCatcher {
    error: string
  }

  export type Type<T> = {
    sanitize<S = T>(value: S): T;
    validate<S = T>(value: S, options?: {
      errorCatcher?: ErrorCatcher
    }): boolean;
  }
  ` +
    Object.entries(types)
      .map(
        ([name, type]) => `
        export type ${name} = ${generateTypeDeclaration(type)};

        export const ${name}: Type<${name}> = {
          sanitize(__value__: unknown) {
            ${name}.validate(__value__);
            return ${generateTypeSanitizer(type, "__value__", [name])}
          },
          validate(__value__: any, { errorCatcher } = {}): __value__ is ${name} {
            try {
              return ${generateTypeValidator(type, "__value__", [name])}
            } catch (e: any) {
              if (!(e instanceof ValidationError)) {
                throw e;
              }
              if (errorCatcher) {
                errorCatcher.error = e.message;
                return false;
              } else {
                throw e;
              }
            }
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

function generateTypeValidator(
  type: Type,
  value: string,
  path: string[]
): string {
  switch (type.kind) {
    case "alias":
      return `${type.name}.validate(${value})`;
    case "number":
      return `typeof(${value}) === 'number' || fail("${path.join(
        "."
      )} is not a number", ${value})`;
    case "object":
      return `typeof(${value}) === 'object' && ${value} !== null
        ${Object.entries(type.properties)
          .map(([name, property]) => {
            const propertyAccessor = `(${value} as any)["${name}"]`;
            let condition = generateTypeValidator(
              property.type,
              propertyAccessor,
              [...path, name]
            );
            if (!property.required) {
              condition = `${propertyAccessor} === undefined || (${condition})`;
            }
            return `&& (${condition})`;
          })
          .join("")}
        || fail("${path.join(".")} is not an object", ${value})`;
    case "string":
      return `typeof(${value}) === 'string' || fail("${path.join(
        "."
      )} is not a string", ${value})`;
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
      return value;
    case "object":
      const localName = variableNameFromPath(path);
      return `(() => {
        const ${localName}: any = ${value};
        const ${localName}_sanitized: any = {};
        ${Object.entries(type.properties)
          .map(([name, property]) => {
            const propertyAccessor = `${localName}["${name}"]`;
            let statement = `${localName}_sanitized["${name}"] = ${generateTypeSanitizer(
              property.type,
              propertyAccessor,
              [...path, name]
            )};`;
            if (!property.required) {
              statement = `if (${propertyAccessor} !== undefined) { ${statement} }`;
            }
            return statement;
          })
          .join("")}
        return ${localName}_sanitized;
      })()`;
    case "string":
      return value;
    default:
      throw assertNever(type);
  }
}

function variableNameFromPath(path: string[]) {
  const name = path.join("_");
  return name.charAt(0).toLowerCase() + name.slice(1);
}
