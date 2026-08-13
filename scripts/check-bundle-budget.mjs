import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const assetsDirectory = path.resolve("dist/public/assets");
// Includes the independently lazy-loaded guided exercise route added in v1.3.
// Keep the ceiling below 680 KiB so additional route code must justify its cost.
const maximumTotalJavaScriptBytes = 680 * 1024;
const maximumSingleJavaScriptBytes = 600 * 1024;

async function javascriptAssets(directory) {
  const entries = await readdir(directory);
  const files = await Promise.all(
    entries
      .filter(entry => entry.endsWith(".js"))
      .map(async entry => {
        const file = path.join(directory, entry);
        return { file, size: (await stat(file)).size };
      })
  );
  return files.sort((left, right) => right.size - left.size);
}

try {
  const assets = await javascriptAssets(assetsDirectory);
  const totalBytes = assets.reduce((total, asset) => total + asset.size, 0);
  const largest = assets[0];

  if (!largest) {
    throw new Error("No JavaScript assets were found. Run pnpm build first.");
  }

  const violations = [
    totalBytes > maximumTotalJavaScriptBytes
      ? `total JavaScript ${totalBytes} B exceeds ${maximumTotalJavaScriptBytes} B`
      : null,
    largest.size > maximumSingleJavaScriptBytes
      ? `largest JavaScript asset ${largest.size} B exceeds ${maximumSingleJavaScriptBytes} B`
      : null,
  ].filter(value => value !== null);

  console.info(
    JSON.stringify({
      event: "bundle_budget_checked",
      totalJavaScriptBytes: totalBytes,
      largestJavaScriptAsset: path.basename(largest.file),
      largestJavaScriptBytes: largest.size,
      maximumTotalJavaScriptBytes,
      maximumSingleJavaScriptBytes,
    })
  );

  if (violations.length) {
    throw new Error(`Bundle budget exceeded: ${violations.join("; ")}`);
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Bundle budget check failed"
  );
  process.exitCode = 1;
}
