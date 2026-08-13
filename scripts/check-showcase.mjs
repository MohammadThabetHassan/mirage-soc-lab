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
  "Catalog traceability",
  "Catalog v1.2.0",
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

const headingCount = (index.match(/<h1\b/gi) ?? []).length;
if (headingCount !== 1) {
  throw new Error(
    `Showcase must contain exactly one h1, found ${headingCount}.`
  );
}

for (const semanticElement of ["<main", "<nav", "<footer"]) {
  if (!index.includes(semanticElement)) {
    throw new Error(
      `Showcase is missing required semantic structure: ${semanticElement}`
    );
  }
}

const hrefs = Array.from(
  index.matchAll(/href="([^"]+)"/g),
  match => match[1] ?? ""
);
for (const href of hrefs.filter(href => href.startsWith("https://"))) {
  if (
    !href.startsWith("https://github.com/MohammadThabetHassan/mirage-soc-lab")
  ) {
    throw new Error(
      `Showcase links to an unapproved external destination: ${href}`
    );
  }
}

for (const evidencePath of [
  "docs/DETECTION_ENGINEERING_GUIDE.md",
  "server/soc/rules/catalog.json",
  "actions",
]) {
  if (!index.includes(evidencePath)) {
    throw new Error(
      `Showcase is missing a required repository-evidence link: ${evidencePath}`
    );
  }
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
    semanticHeadingCount: headingCount,
    checkedLinks: hrefs.length,
  })
);
