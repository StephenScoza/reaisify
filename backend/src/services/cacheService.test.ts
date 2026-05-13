import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CacheService } from "./cacheService.js";

const testDirs: string[] = [];

const createStorageDir = () => {
  const dir = mkdtempSync(path.join(tmpdir(), "reaisify-cache-"));
  testDirs.push(dir);
  return dir;
};

afterEach(() => {
  vi.useRealTimers();

  while (testDirs.length > 0) {
    const dir = testDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("CacheService", () => {
  it("returns cached values before they expire", () => {
    const cache = new CacheService();

    cache.set("latest:usd-brl", { rate: 5.12 }, 60_000);

    expect(cache.get<{ rate: number }>("latest:usd-brl")).toEqual({ rate: 5.12 });
  });

  it("evicts expired values", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const cache = new CacheService();

    cache.set("latest:usd-brl", { rate: 5.12 }, 1_000);
    vi.setSystemTime(new Date("2026-01-01T00:00:02.000Z"));

    expect(cache.get("latest:usd-brl")).toBeNull();
  });

  it("persists non-expired values to disk and reloads them", () => {
    const storageDir = createStorageDir();
    const fileName = "fx-cache-test.json";
    const firstCache = new CacheService({ persist: true, storageDir, fileName });

    firstCache.set("history:usd-brl:30D", { points: 30 }, 60_000);
    const secondCache = new CacheService({ persist: true, storageDir, fileName });

    expect(secondCache.get<{ points: number }>("history:usd-brl:30D")).toEqual({ points: 30 });
  });

  it("reports cache entry TTL status", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const cache = new CacheService();

    cache.set("history:usd-brl:7D", { points: 7 }, 120_000);
    cache.set("latest:usd-brl", { rate: 5.12 }, 60_000);

    expect(cache.getStatus()).toEqual([
      {
        key: "history:usd-brl:7D",
        expiresAt: "2026-01-01T00:02:00.000Z",
        ttlSeconds: 120,
        isExpired: false,
      },
      {
        key: "latest:usd-brl",
        expiresAt: "2026-01-01T00:01:00.000Z",
        ttlSeconds: 60,
        isExpired: false,
      },
    ]);
  });
});
