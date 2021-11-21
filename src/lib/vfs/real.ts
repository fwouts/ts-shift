import fs from "fs-extra";
import path from "path";
import { Directory, Entry, File, Reader } from "./api";

export class FsReader implements Reader {
  currentDirectory() {
    return process.cwd();
  }

  read(filePath: string): Entry | null {
    if (!fs.pathExistsSync(filePath)) {
      return null;
    }
    return this.readExisting(filePath);
  }

  private readExisting(filePath: string): Entry | null {
    const lstat = fs.lstatSync(filePath);
    if (lstat.isDirectory()) {
      return this.readDirectory(filePath);
    } else if (lstat.isFile()) {
      return this.readFile(filePath);
    } else if (lstat.isSymbolicLink()) {
      return this.readSymbolicLink(filePath);
    } else {
      return null;
    }
  }

  private readDirectory(dirPath: string): Directory {
    const name = path.basename(dirPath);
    return {
      kind: "directory",
      name,
      entries: () => {
        const entries = fs
          .readdirSync(dirPath)
          .map((f) => this.readExisting(path.join(dirPath, f)));
        return entries.filter(Boolean) as Entry[];
      },
    };
  }

  private readFile(filePath: string): File {
    const name = path.basename(filePath);
    let stat: fs.Stats | null;
    const getStat = () => {
      if (stat) {
        return stat;
      }
      return (stat = fs.lstatSync(filePath));
    };
    return {
      kind: "file",
      name,
      lastModifiedMillis: () => {
        return getStat().mtimeMs;
      },
      read: () => fs.readFileSync(filePath, "utf8"),
    };
  }

  private readSymbolicLink(filePath: string): File | Directory {
    const name = path.basename(filePath);
    const lstat = fs.lstatSync(filePath);
    if (lstat.isSymbolicLink()) {
      const target = fs.readlinkSync(filePath);
      if (!fs.pathExistsSync(target)) {
        // The target does not exist.
        return {
          kind: "directory",
          name,
          entries: () => [],
        };
      }
    }
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      return {
        kind: "file",
        name,
        lastModifiedMillis: () => {
          return Math.max(lstat.mtimeMs, stat.mtimeMs);
        },
        read: () => fs.readFileSync(filePath, "utf8"),
      };
    } else {
      return {
        kind: "directory",
        name,
        entries: () => {
          const entries = fs
            .readdirSync(filePath)
            .map((f) => this.readExisting(path.join(filePath, f)));
          return entries.filter(Boolean) as Entry[];
        },
      };
    }
  }
}
