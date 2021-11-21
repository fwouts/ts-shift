import path from "path";
import { Writer } from ".";
import { Directory, Entry, File, Reader } from "./api";

export class MemoryReader implements Reader, Writer {
  private files: { [filePath: string]: MemoryFile } = {};

  constructor(private readonly currentDirectoryPath: string) {}

  currentDirectory() {
    return this.currentDirectoryPath;
  }

  updateFile(filePath: string, sourceText: string | null) {
    // Note: backslash handling is Windows-specific.
    filePath = filePath.replace(/\//g, path.sep);
    if (sourceText === null) {
      delete this.files[filePath];
    } else {
      const existingSource = this.files[filePath]?.sourceText;
      if (sourceText !== existingSource) {
        this.files[filePath] = {
          sourceText,
          timestampMillis: Date.now(),
        };
      }
    }
  }

  read(filePath: string): Entry | null {
    // Note: backslash handling is Windows-specific.
    filePath = filePath.replace(/\//g, path.sep);
    const file = this.files[filePath];
    if (file) {
      return this.readFile(filePath, file);
    }
    const dirPath = filePath.endsWith(path.sep)
      ? filePath.substr(0, filePath.length - 1)
      : filePath;
    for (const otherFilePath of Object.keys(this.files)) {
      if (otherFilePath.startsWith(dirPath + path.sep)) {
        return this.readDirectory(dirPath);
      }
    }
    return null;
  }

  private readFile(filePath: string, file: MemoryFile): File {
    return {
      kind: "file",
      name: path.basename(filePath),
      lastModifiedMillis: () => file.timestampMillis,
      read: () => file.sourceText,
    };
  }

  private readDirectory(dirPath: string): Directory {
    return {
      kind: "directory",
      name: path.basename(dirPath),
      entries: () => this.readDirectoryEntries(dirPath),
    };
  }

  private readDirectoryEntries(dirPath: string): Entry[] {
    const directories = new Set<string>();
    const files: File[] = [];
    for (const [filePath, file] of Object.entries(this.files)) {
      if (filePath.startsWith(dirPath + path.sep)) {
        const relativePath = filePath.substr(dirPath.length + 1);
        const [name, ...rest] = relativePath.split(path.sep);
        if (!name) {
          continue;
        }
        if (rest.length === 0) {
          files.push(this.readFile(filePath, file));
        } else {
          directories.add(name);
        }
      }
    }
    return [
      ...files,
      ...[...directories].map((dirName) =>
        this.readDirectory(path.join(dirPath, dirName))
      ),
    ];
  }
}

export interface MemoryFile {
  timestampMillis: number;
  sourceText: string;
}
