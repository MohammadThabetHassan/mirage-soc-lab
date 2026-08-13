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

const headingLevels = Array.from(index.matchAll(/<h([1-6])\b/gi), match =>
  Number(match[1])
);
if (
  headingLevels[0] !== 1 ||
  headingLevels.some(
    (level, index) => index > 0 && level - headingLevels[index - 1] > 1
  )
) {
  throw new Error(
    "Showcase headings must begin at h1 without skipping levels."
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

const links = Array.from(
  index.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi),
  match => ({
    attributes: match[1] ?? "",
    text: (match[2] ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  })
);
if (
  links.some(
    link =>
      link.text.length === 0 && !/aria-label="[^"]+"/i.test(link.attributes)
  )
) {
  throw new Error(
    "Showcase links must expose meaningful text or an aria-label."
  );
}

const images = Array.from(
  index.matchAll(/<img\b([^>]*)>/gi),
  match => match[1] ?? ""
);
if (images.some(attributes => !/\balt="[^"]*"/i.test(attributes))) {
  throw new Error("Every showcase image must declare an alt attribute.");
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

const colorTokens = Object.fromEntries(
  Array.from(stylesheet.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi), match => [
    match[1],
    match[2],
  ])
);
function relativeLuminance(hex) {
  const channels = [1, 3, 5].map(
    index => Number.parseInt(hex.slice(index, index + 2), 16) / 255
  );
  const linear = channels.map(value =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrastRatio(foreground, background) {
  const [lighter, darker] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((left, right) => right - left);
  return (lighter + 0.05) / (darker + 0.05);
}
for (const [foregroundName, backgroundName] of [
  ["ink", "paper"],
  ["muted", "paper"],
  ["teal", "paper"],
]) {
  const foreground = colorTokens[foregroundName];
  const background = colorTokens[backgroundName];
  if (
    !foreground ||
    !background ||
    contrastRatio(foreground, background) < 4.5
  ) {
    throw new Error(
      `Showcase color tokens must maintain 4.5:1 contrast for ${foregroundName} on ${backgroundName}.`
    );
  }
}

await Promise.all([access(indexPath), access(stylesheetPath)]);

console.info(
  JSON.stringify({
    event: "showcase_static_contract_checked",
    directory: "showcase",
    requiredContent: requiredContent.length,
    semanticHeadingCount: headingCount,
    headingOrder: headingLevels,
    checkedLinks: hrefs.length,
    checkedImages: images.length,
  })
);
