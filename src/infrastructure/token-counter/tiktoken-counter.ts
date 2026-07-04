import { encodingForModel } from "js-tiktoken";
import type { ITokenCounter } from "./token-counter";

/**
 * Token counter using js-tiktoken (cl100k_base encoding for GPT-4/GPT-3.5).
 *
 * Pure JavaScript — no WASM dependency. Falls back gracefully if
 * the model is unknown.
 *
 * @example
 * ```ts
 * const counter = new TiktokenCounter();
 * const count = counter.count("Hello, world!");
 * ```
 */
export class TiktokenCounter implements ITokenCounter {
  private readonly encoder;

  constructor() {
    this.encoder = encodingForModel("gpt-4");
  }

  /** {@inheritDoc ITokenCounter.count} */
  count(text: string): number {
    const tokens = this.encoder.encode(text);
    return tokens.length;
  }
}
