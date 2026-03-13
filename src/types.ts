export interface KompressorOptions {
  /**
   * File extensions to compress.
   * @default ['.html', '.css', '.js', '.json']
   */
  extensions?: string[];

  /**
   * Brotli compression quality level (0–11).
   * Higher = smaller file, slower compression.
   * @default 11
   */
  quality?: number;

  /**
   * Keep the original file alongside the generated `.br` file.
   * Set to false to delete the original after compression.
   * @default true
   */
  keepOriginal?: boolean;
}
