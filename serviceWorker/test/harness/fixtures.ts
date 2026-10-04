import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export const FIXTURES_DIR = join(import.meta.dir, "..", "fixtures");

// fixture("m3u8/media-live-ts.m3u8") -> file text
export const fixture = (path: string): string => readFileSync(join(FIXTURES_DIR, path), "utf8");

export const fixtureJson = <T = any>(path: string): T => JSON.parse(fixture(path));

export const listFixtures = (dir: "m3u8" | "gql"): string[] => readdirSync(join(FIXTURES_DIR, dir)).sort();
