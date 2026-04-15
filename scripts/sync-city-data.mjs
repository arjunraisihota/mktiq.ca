import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourceCandidates = [path.join(projectRoot, "output"), path.join(projectRoot, "..", "output")];

const destination = path.join(projectRoot, "data", "cities");

function findSourceDir() {
  for (const dir of sourceCandidates) {
    if (path.resolve(dir) === path.resolve(destination)) continue;
    if (!fs.existsSync(dir)) continue;
    const jsonFiles = fs.readdirSync(dir).filter((name) => name.endsWith(".json"));
    if (jsonFiles.length > 0) {
      return { dir, jsonFiles };
    }
  }

  return null;
}

function syncData() {
  const source = findSourceDir();

  if (!source) {
    console.error("No JSON city files found in data/cities, output, or ../output.");
    process.exit(1);
  }

  fs.mkdirSync(destination, { recursive: true });

  for (const fileName of fs.readdirSync(destination)) {
    if (fileName.endsWith(".json")) {
      fs.unlinkSync(path.join(destination, fileName));
    }
  }

  for (const fileName of source.jsonFiles) {
    fs.copyFileSync(path.join(source.dir, fileName), path.join(destination, fileName));
  }

  console.log(`Synced ${source.jsonFiles.length} file(s) from ${source.dir} to ${destination}.`);
}

syncData();
