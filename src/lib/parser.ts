import fs from "fs";
import ts from "typescript";
import { inspect } from "util";
import { ObjectProperty, Type } from "./types";

export function parse(filePaths: string[]) {
  const serviceHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => {
      return filePaths;
    },
    getScriptVersion: (fileName) => {
      return fs.statSync(fileName).mtimeMs.toString(10);
    },
    getScriptSnapshot: (fileName) => {
      const fileContent = ts.sys.readFile(fileName);
      if (!fileContent) {
        return;
      }
      return ts.ScriptSnapshot.fromString(fileContent);
    },
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCompilationSettings: ts.getDefaultCompilerOptions,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: ts.sys.fileExists,
    directoryExists: ts.sys.directoryExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    getDirectories: ts.sys.getDirectories,
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
  const types: Record<string, Type> = {};
  for (const filePath of filePaths) {
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
      throw new Error(`Missing source file: ${filePath}`);
    }
    for (const statement of sourceFile.statements) {
      if (
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)
      ) {
        const type = checker.getTypeAtLocation(statement);
        if (hasTypeParameters(type)) {
          continue;
        }
        types[statement.name.text] = extractType(type, true);
      }
    }
  }
  return types;

  function extractType(type: ts.Type, ignoreTypeName = false): Type {
    const name = type.getSymbol()?.name;
    if (
      !ignoreTypeName &&
      name &&
      name !== "__type" &&
      !hasTypeParameters(type)
    ) {
      types[name] = extractType(type, true);
      return {
        kind: "alias",
        name,
      };
    }
    if (type.flags === ts.TypeFlags.String) {
      return {
        kind: "string",
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
