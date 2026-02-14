import fs from "fs";
import path from "path";

export function loadJSON<T>(file: string): T[] {
  const filePath = path.join(__dirname, "../../data", file);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
