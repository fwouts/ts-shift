import ts from "typescript";
import { inspect } from "util";
import { ObjectProperty, Type } from "./types";
import { Reader } from "./vfs";

export function parse(reader: Reader, filePaths: string[]) {
  const serviceHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => {
      return filePaths;
    },
    getScriptVersion: (fileName) => {
      const file = reader.read(fileName);
      if (file?.kind !== "file") {
        throw new Error(`Expected a file: ${fileName}`);
      }
      return file.lastModifiedMillis().toString(10);
    },
    getScriptSnapshot: (fileName) => {
      const file = reader.read(fileName);
      if (file?.kind !== "file") {
        return;
      }
      return ts.ScriptSnapshot.fromString(file.read());
    },
    getCurrentDirectory: () => {
      return reader.currentDirectory();
    },
    getCompilationSettings: ts.getDefaultCompilerOptions,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: (path) => reader.read(path)?.kind === "file",
    readFile: (path) => {
      const file = reader.read(path);
      if (file?.kind !== "file") {
        return;
      }
      return file.read();
    },
    directoryExists: (directoryName) =>
      reader.read(directoryName)?.kind === "directory",
    getDirectories: (directoryName) => {
      const dir = reader.read(directoryName);
      if (dir?.kind !== "directory") {
        return [];
      }
      return dir
        .entries()
        .filter((entry) => entry.kind === "directory")
        .map((entry) => entry.name);
    },
    readDirectory: () => {
      throw new Error(`readDirectory is not implemented`);
    },
  };
  const service = ts.createLanguageService(
    serviceHost,
    ts.createDocumentRegistry()
  );
  const program = service.getProgram();
  if (!program) {
    throw new Error(`Unable to build TypeScript program`);
  }
  const checker = program.getTypeChecker();
  const pendingTypes: Record<string, Type | { kind: "pending" }> = {};
  for (const filePath of filePaths) {
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
      throw new Error(`Missing source file: ${filePath}`);
    }
    for (const statement of sourceFile.statements) {
      if (
        !statement.modifiers?.find(
          (m) => m.kind === ts.SyntaxKind.ExportKeyword
        )
      ) {
        // Only generate exported types.
        continue;
      }
      if (
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)
      ) {
        const type = checker.getTypeAtLocation(statement);
        if (hasTypeParameters(type)) {
          continue;
        }
        pendingTypes[statement.name.text] = extractType(type, true);
      }
    }
  }
  service.dispose();
  const types: Record<string, Type> = {};
  for (const [name, type] of Object.entries(pendingTypes)) {
    if (type.kind === "pending") {
      throw new Error(`Unable to resolve type ${name}`);
    }
    types[name] = type;
  }
  return types;

  function extractType(type: ts.Type, ignoreTypeName = false): Type {
    const aliasName = type.aliasSymbol?.name;
    const symbolName = type.getSymbol()?.name;
    const name = aliasName || symbolName;
    if (aliasName === "Array") {
      const typeArguments = ((type as any).aliasTypeArguments || []).map(
        (t: ts.Type) => extractType(t)
      );
      const typeArgument = typeArguments[0];
      if (!typeArgument) {
        throw new Error(
          `Expected a type argument in array type: ${checker.typeToString(
            type
          )}`
        );
      }
      return {
        kind: "array",
        type: typeArgument,
      };
    } else if (symbolName === "Array") {
      const typeArguments = (
        checker.getTypeArguments(type as ts.TypeReference) || []
      ).map((t) => extractType(t));
      const typeArgument = typeArguments[0];
      if (!typeArgument) {
        throw new Error(
          `Expected a type argument in array type: ${checker.typeToString(
            type
          )}`
        );
      }
      return {
        kind: "array",
        type: typeArgument,
      };
    } else if (
      !ignoreTypeName &&
      name &&
      name !== "__type" &&
      !hasTypeParameters(type)
    ) {
      if (!pendingTypes[name]) {
        pendingTypes[name] = { kind: "pending" };
        pendingTypes[name] = extractType(type, true);
      }
      return {
        kind: "alias",
        name,
      };
    } else if (type.flags === ts.TypeFlags.Any) {
      return {
        kind: "any",
      };
    } else if ((type.flags & ~ts.TypeFlags.Union) === ts.TypeFlags.Boolean) {
      // Note: boolean types also have the union flag, because they're the
      // union of false and true, hence why we ignore this additional flag.
      return {
        kind: "boolean",
      };
    } else if (type.flags === ts.TypeFlags.BooleanLiteral) {
      const intrinsicName = (type as any).intrinsicName;
      switch (intrinsicName) {
        case "false":
          return {
            kind: "literal",
            value: false,
          };
        case "true":
          return {
            kind: "literal",
            value: true,
          };
        default:
          throw new Error(
            `Boolean literal type with unexpected intrinsic name: ${intrinsicName}`
          );
      }
    } else if (type.isNumberLiteral() || type.isStringLiteral()) {
      return {
        kind: "literal",
        value: type.value,
      };
    } else if (type.flags === ts.TypeFlags.Null) {
      return {
        kind: "null",
      };
    } else if (type.flags === ts.TypeFlags.Number) {
      return {
        kind: "number",
      };
    } else if (type.flags === ts.TypeFlags.Object) {
      const properties: Record<string, ObjectProperty> = {};
      for (const property of type.getProperties()) {
        if (!property.valueDeclaration) {
          throw new Error(
            `Property ${property.name} is missing a value declaration`
          );
        }
        const isOptional = property.flags & ts.SymbolFlags.Optional;
        const propertyType = extractType(
          checker.getTypeOfSymbolAtLocation(property, property.valueDeclaration)
        );
        properties[property.name] = {
          required: !isOptional,
          type: propertyType,
        };
      }
      return {
        kind: "object",
        properties,
      };
    } else if (type.flags === ts.TypeFlags.String) {
      return {
        kind: "string",
      };
    } else if (
      type.flags === ts.TypeFlags.Undefined ||
      type.flags === ts.TypeFlags.Void
    ) {
      return {
        kind: "undefined",
      };
    } else if (type.isUnion()) {
      return {
        kind: "union",
        types: type.types.map((subtype) => extractType(subtype)),
      };
    } else if (type.isIntersection()) {
      return {
        kind: "intersection",
        types: type.types.map((subtype) => extractType(subtype)),
      };
    } else {
      throw new Error(`Unsupported type:\n${inspect(type)}`);
    }
  }
}

function hasTypeParameters(type: ts.Type) {
  // Note: These properties are undocumented.
  return (
    ((type as any).typeParameters || []).length > 0 ||
    ((type as any).resolvedTypeArguments || []).length > 0
  );
}
