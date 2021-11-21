export interface Reader {
  currentDirectory(): string;
  read(filePath: string): Entry | null;
}

export interface Writer {
  updateFile(filePath: string, sourceText: string | null): void;
}

export type Entry = File | Directory;

export interface File {
  kind: "file";
  name: string;
  lastModifiedMillis(): number;
  read(): string;
}

export interface Directory {
  kind: "directory";
  name: string;
  entries(): Entry[];
}
