import OpenAI from "openai";
import type { IChatCompletionRequest } from "../../types";
import type { ILLMService } from "../../ports";
import type { ITokenCounter } from "../token-counter/token-counter";

/**
 * OpenAI-backed implementation of {@link ILLMService}.
 *
 * Streams completions token-by-token via the OpenAI SDK.
 * Counts prompt and response tokens using the injected counter.
 *
 * @example
 * ```ts
 * const service = new OpenAILLMService("sk-...", new TiktokenCounter());
 * for await (const token of service.stream(request)) {
 *   process.stdout.write(token);
 * }
 * ```
 */
export class OpenAILLMService implements ILLMService {
  private readonly client: OpenAI;
  private readonly tokenCounter: ITokenCounter;
  private readonly model: string;

  /**
   * Create a new OpenAI LLM service.
   *
   * @param apiKey - The OpenAI API key.
   * @param tokenCounter - Counter for prompt/response token counting.
   * @param options - Optional configuration for base URL and model.
   *
   * @example
   * ```ts
   * const service = new OpenAILLMService("sk-...", new TiktokenCounter(), {
   *   baseUrl: "https://api.openai.com/v1",
   *   model: "gpt-4",
   * });
   * ```
   */
  constructor(
    apiKey: string,
    tokenCounter: ITokenCounter,
    options?: { readonly baseUrl?: string; readonly model?: string },
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL: options?.baseUrl,
    });
    this.tokenCounter = tokenCounter;
    this.model = options?.model ?? "gpt-4";
  }

  /** {@inheritDoc ILLMService.stream} */
  async *stream(request: IChatCompletionRequest): AsyncIterable<string> {
    const promptText = [request.systemPrompt, ...request.history.map((m) => m.content)].join("\n");
    const _promptTokens = this.tokenCounter.count(promptText);

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        ...request.history.map((msg) => ({
          role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.content,
        })),
      ],
      temperature: request.options.temperature,
      stream: true,
    });

    let responseText = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        responseText += delta;
        yield delta;
      }
    }

    const _responseTokens = this.tokenCounter.count(responseText);
  }
}
