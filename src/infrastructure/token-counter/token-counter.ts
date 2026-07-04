/**
 * Contract for counting tokens in text.
 *
 * Abstracts the tokenization library behind a clean interface,
 * enabling swap from tiktoken to any future counter.
 *
 * @example
 * ```ts
 * class TiktokenCounter implements ITokenCounter {
 *   count(text: string): number { return encode(text).length; }
 * }
 * ```
 */
export interface ITokenCounter {
  /**
   * Count the number of tokens in a text string.
   *
   * @param text - The text to tokenize.
   * @returns The token count.
   *
   * @example
   * ```ts
   * const count = counter.count("Hello, world!");
   * // 4
   * ```
   */
  count(text: string): number;
}
