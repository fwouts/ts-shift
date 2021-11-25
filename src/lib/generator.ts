import assertNever from "assert-never";
import prettier from "prettier";
import { Type } from "./types";

export function generate(types: Record<string, Type>) {
  const definitions = Object.entries(types)
    .map(
      ([name, type]) => `
    export type ${name} = ${generateTypeDeclaration(type)};

    export const ${name} = Object.freeze({
      name: ${JSON.stringify(name)},
      schema: ${generateSchema(type)},
      create(__value__: ${name}): ${name} {
        let result: ${name};
        ${generateTypeSanitizer(type, "__value__", "result", [name])};
        return result;
      },
    } as const);
    `
    )
    .join("\n");
  const unformatted = `
  ${definitions}

  function fail(message: string, value: unknown): never {
    let debugValue: string;
    try {
      debugValue = JSON.stringify(value, null, 2);
    } catch (e) {
      // Not representable in JSON.
      debugValue = \`\${value}\`;
    }
    throw new ValidationError(message + ':\\n' + debugValue);
  }

  export class ValidationError extends Error {
    constructor(message = "") {
      super(message);
    }
  }

  export type Type<T> = {
    readonly name: string;
    readonly schema: Schema;
    create(value: unknown): T;
  }

  export type Schema =
  | {
      readonly kind: "alias";
      readonly type: () => Type<unknown>;
    }
  | {
      readonly kind: "any";
    }
  | {
      readonly kind: "array";
      readonly schema: Schema;
    }
  | {
      readonly kind: "boolean";
    }
  | {
      readonly kind: "literal";
      readonly value: boolean | number | string;
    }
  | {
      readonly kind: "null";
    }
  | {
      readonly kind: "number";
    }
  | {
      readonly kind: "object";
      readonly properties: Readonly<Record<string, ObjectSchemaProperty>>;
    }
  | {
      readonly kind: "string";
    }
  | {
      readonly kind: "undefined";
    }
  | {
      readonly kind: "union";
      readonly schemas: ReadonlyArray<Schema>;
    };

  export type ObjectSchemaProperty = {
    schema: Schema;
    required: boolean;
  }
  `;
  return prettier.format(unformatted, {
    parser: "babel-ts",
  });
}

function generateSchema(type: Type): string {
  switch (type.kind) {
    case "alias":
      return `{
        kind: "alias",
        type: () => ${type.name}
      }`;
    case "any":
      return `{
        kind: "any"
      }`;
    case "array":
      return `{
        kind: "array",
        schema: ${generateSchema(type.type)}
      }`;
    case "boolean":
      return `{
        kind: "boolean"
      }`;
    case "literal":
      return `{
        kind: "literal",
        value: ${JSON.stringify(type.value)}
      }`;
    case "null":
      return `{
        kind: "null"
      }`;
    case "number":
      return `{
        kind: "number"
      }`;
    case "object":
      return `{
        kind: "object",
        properties: {
          ${Object.entries(type.properties)
            .map(
              ([name, property]) =>
                `["${name}"]: {
                  schema: ${generateSchema(property.type)},
                  required: ${JSON.stringify(property.required)}
                }`
            )
            .join(",")}
        }
      }`;
    case "string":
      return `{
        kind: "string"
      }`;
    case "undefined":
      return `{
        kind: "undefined"
      }`;
    case "union":
      return `{
        kind: "union",
        schemas: [
          ${type.types.map((subtype) => generateSchema(subtype)).join(",")}
        ]
      }`;
    default:
      throw assertNever(type);
  }
}

function generateTypeDeclaration(type: Type): string {
  switch (type.kind) {
    case "alias":
      return type.name;
    case "any":
      return `any`;
    case "array":
      return `Array<${generateTypeDeclaration(type.type)}>`;
    case "boolean":
      return "boolean";
    case "literal":
      return JSON.stringify(type.value);
    case "null":
      return "null";
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
    case "undefined":
      return "undefined";
    case "union":
      return type.types
        .map((subtype) => `(${generateTypeDeclaration(subtype)})`)
        .join("|");
    default:
      throw assertNever(type);
  }
}

function generateTypeSanitizer(
  type: Type,
  value: string,
  assignTo: string,
  path: string[]
): string {
  switch (type.kind) {
    case "alias":
      return `
      ${assignTo} = ${type.name}.create(${value});
      `.trim();
    case "any":
      return `
      ${assignTo} = ${value};
      `.trim();
    case "array":
      const itemPath = [...path, "item"];
      const itemVariableName = variableNameFromPath(itemPath);
      return `
      if (!Array.isArray(${value})) {
        fail("${path.join(".")} is not an array", ${value});
      }
      ${assignTo} = [];
      for (const item of ${value}) {
        let ${itemVariableName};
        ${generateTypeSanitizer(type.type, "item", itemVariableName, itemPath)}
        ${assignTo}.push(${itemVariableName});
      }
      `.trim();
    case "boolean":
      return `
      if (typeof(${value}) !== 'boolean') {
        fail("${path.join(".")} is not a boolean", ${value});
      }
      ${assignTo} = ${value};
      `.trim();
    case "literal":
      return `
      if (${value} !== ${JSON.stringify(type.value)}) {
        fail("${path.join(".")} must equal ${JSON.stringify(
        type.value
      )}", ${value});
      }
      ${assignTo} = ${value};
      `.trim();
    case "null":
      return `
      if (${value} !== null) {
        fail("${path.join(".")} is not null", ${value});
      }
      ${assignTo} = null;
      `.trim();
    case "number":
      return `
      if (typeof(${value}) !== 'number') {
        fail("${path.join(".")} is not a number", ${value});
      }
      ${assignTo} = ${value};
      `.trim();
    case "object":
      const localName = variableNameFromPath(path);
      return `
        if (typeof(${value}) !== 'object' || ${value} === null) {
          fail("${path.join(".")} is not an object", ${value});
        }
        const _${localName}: any = ${value};
        ${assignTo} = {} as any;
        ${Object.entries(type.properties)
          .map(([name, property]) => {
            const propertyAccessor = `_${localName}["${name}"]`;
            const propertyPath = [...path, name];
            const propertyVariableName = variableNameFromPath(propertyPath);
            let statement = `
            let ${propertyVariableName}: ${generateTypeDeclaration(
              property.type
            )}
            ${generateTypeSanitizer(
              property.type,
              propertyAccessor,
              propertyVariableName,
              propertyPath
            )}
            ${assignTo}["${name}"] = ${propertyVariableName};
            `.trim();
            if (!property.required) {
              statement = `if (${propertyAccessor} !== undefined) {
                ${statement}
              }`;
            }
            return statement;
          })
          .join("")}
      `.trim();
    case "string":
      return `
      if (typeof(${value}) !== 'string') {
        fail("${path.join(".")} is not a string", ${value});
      }
      ${assignTo} = ${value};
      `.trim();
    case "undefined":
      return `
      if (${value} !== undefined) {
        fail("${path.join(".")} is not undefined", ${value});
      }
      `.trim();
    case "union":
      return `union: {
          ${type.types
            .map(
              (subtype) => `
          try {
            ${generateTypeSanitizer(subtype, value, assignTo, path)}
            break union;
          } catch (e) {
            if (e instanceof ValidationError) {
              // Ignore, another subtype will be fine.
            } else {
              throw e;
            }
          }`
            )
            .join("")}
          fail("${path.join(
            "."
          )} does not match any possible union type", ${value});
        }`.trim();
    default:
      throw assertNever(type);
  }
}

function variableNameFromPath(path: string[]) {
  const name = path.join("_");
  return name.charAt(0).toLowerCase() + name.slice(1);
}
