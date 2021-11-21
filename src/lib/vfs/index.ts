export * from "./api";
import { Reader, Writer } from "./api";
import { MemoryReader } from "./memory";
import { FsReader } from "./real";

export function createMemoryReader(
  currentDirectoryPath: string
): Reader & Writer {
  return new MemoryReader(currentDirectoryPath);
}

export function createFileSystemReader(): Reader {
  return new FsReader();
}
