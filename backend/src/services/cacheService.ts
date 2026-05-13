import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheEntryStatus {
  key: string;
  expiresAt: string;
  ttlSeconds: number;
  isExpired: boolean;
}

interface CacheServiceOptions {
  persist?: boolean;
  fileName?: string;
  storageDir?: string;
}

export class CacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly persist: boolean;
  private readonly filePath: string | null;

  constructor(options: CacheServiceOptions = {}) {
    this.persist = options.persist ?? false;
    this.filePath = this.persist
      ? path.join(
          path.resolve(options.storageDir ?? process.env.ALERT_STORAGE_DIR ?? "./runtime"),
          options.fileName ?? "cache.json",
        )
      : null;

    this.loadFromDisk();
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.saveToDisk();
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    this.saveToDisk();
  }

  getStatus(): CacheEntryStatus[] {
    const now = Date.now();

    return Array.from(this.store.entries())
      .map(([key, entry]) => ({
        key,
        expiresAt: new Date(entry.expiresAt).toISOString(),
        ttlSeconds: Math.max(0, Math.round((entry.expiresAt - now) / 1_000)),
        isExpired: entry.expiresAt <= now,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  private loadFromDisk() {
    if (!this.filePath || !existsSync(this.filePath)) {
      return;
    }

    try {
      const raw = readFileSync(this.filePath, "utf8");
      const entries = JSON.parse(raw) as Record<string, CacheEntry<unknown>>;
      const now = Date.now();

      Object.entries(entries).forEach(([key, entry]) => {
        if (entry.expiresAt > now) {
          this.store.set(key, entry);
        }
      });
    } catch (error) {
      console.warn("Failed to load persisted cache; starting with empty cache.", error);
    }
  }

  private saveToDisk() {
    if (!this.filePath) {
      return;
    }

    try {
      mkdirSync(path.dirname(this.filePath), { recursive: true });
      const payload = Object.fromEntries(this.store.entries());
      writeFileSync(this.filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    } catch (error) {
      console.warn("Failed to persist cache.", error);
    }
  }
}
