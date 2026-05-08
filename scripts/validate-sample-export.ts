import { readFile } from "node:fs/promises";
import path from "node:path";
import { researchExportSchema } from "../lib/researchExportSchema";

async function main() {
  const samplePath = path.join(process.cwd(), "sample-data", "complete-research-export.example.json");
  const rawJson = await readFile(samplePath, "utf8");
  const sample = JSON.parse(rawJson);
  const result = researchExportSchema.safeParse(sample);

  if (!result.success) {
    console.error("Sample research export validation failed.");
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  console.log(`Sample research export validation succeeded for session ${result.data.sessionId}.`);
}

main().catch((error) => {
  console.error("Sample research export validation failed.");
  console.error(error);
  process.exit(1);
});
