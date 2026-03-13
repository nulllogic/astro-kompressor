import { readdir, readFile, writeFile, unlink, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { brotliCompress, constants } from "node:zlib";
import { promisify } from "node:util";

const brotliCompressAsync = promisify(brotliCompress);

/**
 * Recursively walks a directory and yields absolute file paths.
 */
export async function* walkDir(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    } c
  }
}

export interface CompressionResult {
  filePath: string;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compresses a single file with Brotli and writes a sibling `.br` file.
 * Returns the original and compressed byte sizes.
 */
export async function compressFile(
  filePath: string,
  quality: number,
  keepOriginal: boolean
): Promise<CompressionResult> {
  const input = await readFile(filePath);
  const compressed = await brotliCompressAsync(input, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: quality,
    },
  });

  await writeFile(`${filePath}.br`, compressed);

  if (!keepOriginal) {
    await unlink(filePath);
  }

  return {
    filePath,
    originalSize: input.byteLength,
    compressedSize: compressed.byteLength,
  };
}

/**
 * Formats a byte count as a human-readable string (B / KB / MB).
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Returns a savings percentage string, e.g. "34.2%".
 */
export function savingsPct(original: number, compressed: number): string {
  const pct = ((original - compressed) / original) * 100;
  return `${pct.toFixed(1)}%`;
}
