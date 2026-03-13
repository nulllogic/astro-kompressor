import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import { extname } from "node:path";
import type { KompressorOptions } from "./types.js";
import { walkDir, compressFile, formatBytes, savingsPct } from "./utils.js";

const DEFAULT_EXTENSIONS = [".html", ".css", ".js", ".json"];
const DEFAULT_QUALITY = 11;

export default function kompressor(
  options: KompressorOptions = {}
): AstroIntegration {
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const keepOriginal = options.keepOriginal ?? true;

  return {
    name: "astro-kompressor",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);

        logger.info(
          `Compressing files in ${outDir} (quality: ${quality}, extensions: ${extensions.join(", ")})`
        );

        let totalFiles = 0;
        let totalOriginalBytes = 0;
        let totalCompressedBytes = 0;

        for await (const filePath of walkDir(outDir)) {
          const ext = extname(filePath).toLowerCase();

          if (!extensions.includes(ext)) continue;

          try {
            const result = await compressFile(filePath, quality, keepOriginal);
            totalFiles++;
            totalOriginalBytes += result.originalSize;
            totalCompressedBytes += result.compressedSize;

            logger.info(
              `  ✓ ${filePath.replace(outDir, "")} ` +
              `${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} ` +
              `(saved ${savingsPct(result.originalSize, result.compressedSize)})`
            );
          } catch (err) {
            logger.error(`  ✗ Failed to compress ${filePath}: ${String(err)}`);
          }
        }

        if (totalFiles === 0) {
          logger.warn("No matching files found to compress.");
        } else {
          logger.info(
            `Done! Compressed ${totalFiles} file(s): ` +
            `${formatBytes(totalOriginalBytes)} → ${formatBytes(totalCompressedBytes)} ` +
            `(saved ${savingsPct(totalOriginalBytes, totalCompressedBytes)})`
          );
        }
      },
    },
  };
}
