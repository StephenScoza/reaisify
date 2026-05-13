import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const storageDir = path.resolve(process.env.ALERT_STORAGE_DIR ?? "./runtime");

const ensureStorageDir = async () => {
  await mkdir(storageDir, { recursive: true });
};

const resolveStoragePath = (fileName: string) => path.join(storageDir, fileName);

export const readJsonFile = async <T>(fileName: string, fallback: T): Promise<T> => {
  await ensureStorageDir();

  try {
    const raw = await readFile(resolveStoragePath(fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeJsonFile(fileName, fallback);
      return fallback;
    }

    throw error;
  }
};

export const writeJsonFile = async <T>(fileName: string, data: T) => {
  await ensureStorageDir();
  await writeFile(resolveStoragePath(fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

export const appendLogLine = async (fileName: string, line: string) => {
  await ensureStorageDir();
  await appendFile(resolveStoragePath(fileName), `${line}\n`, "utf8");
};

export const readLogLines = async (fileName: string, limit = 25): Promise<string[]> => {
  await ensureStorageDir();

  try {
    const raw = await readFile(resolveStoragePath(fileName), "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .reverse();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
};
