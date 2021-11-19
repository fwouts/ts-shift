import assertNever from "assert-never";
import prettier from "prettier";
import { Type } from "./types";

export function generate(types: Record<string, Type>) {
  const unformatted = Object.entries(types)
    .map(
      // TODO: Also remove unwanted properties.
      ([name, type]) => `
        export type ${name} = ${generateTypeDeclaration(type)};

        export const ${name} = {
          sanitize(__value__: unknown): __value__ is ${name} {
            return ${generateTypeValidator(type)}
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

function generateTypeValidator(type: Type): string {
  switch (type.kind) {
    case "alias":
      return `${type.name}.sanitize(__value__)`;
    case "number":
      return `typeof(__value__) === 'number'`;
    case "object":
      return (
        `typeof(__value__) === 'object' && object !== null` +
        Object.entries(type.properties)
          .map(([name, property]) => {
            let subtypeValidator = generateTypeValidator(property.type);
            if (!property.required) {
              subtypeValidator = `__value__ === undefined || (${subtypeValidator})`;
            }
            const propertyAccessor = `object["${name}"]`;
            if ((subtypeValidator.match(/__value__/g) || []).length > 1) {
              return `&& (__value__ => ${subtypeValidator})(${propertyAccessor})`;
            } else {
              return `&& (${subtypeValidator.replace(
                "__value__",
                propertyAccessor
              )})`;
            }
          })
          .join("")
      );
    case "string":
      return `typeof(__value__) === 'string'`;
    default:
      throw assertNever(type);
  }
}
