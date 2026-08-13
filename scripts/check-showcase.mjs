import { access, readFile } from "node:fs/promises";
import path from "node:path";

const showcaseDirectory = path.resolve("showcase");
const indexPath = path.join(showcaseDirectory, "index.html");
const stylesheetPath = path.join(showcaseDirectory, "styles.css");
const index = await readFile(indexPath, "utf8");
const stylesheet = await readFile(stylesheetPath, "utf8");
const normalizedIndex = index.replace(/\s+/g, " ");

const requiredContent = [
  "MIRAGE SOC Lab",
  "Practical use cases",
  "Detection contract",
  "controlled defensive training application",
  "github.com/MohammadThabetHassan/mirage-soc-lab",
];

for (const content of requiredContent) {
  if (!normalizedIndex.includes(content)) {
    throw new Error(`Showcase is missing required content: ${content}`);
  }
}

if (index.includes("manus.computer")) {
  throw new Error(
    "Showcase must not link to the retired external preview domain."
  );
}

if (!stylesheet.includes("@media")) {
  throw new Error("Showcase stylesheet must include a responsive breakpoint.");
}

await Promise.all([access(indexPath), access(stylesheetPath)]);

console.info(
  JSON.stringify({
    event: "showcase_static_contract_checked",
    directory: "showcase",
    requiredContent: requiredContent.length,
  })
);
