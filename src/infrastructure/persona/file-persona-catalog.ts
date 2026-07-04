import { readdir, readFile } from "fs/promises";
import { join, basename } from "path";
import type { IPersonaDefinition } from "../../types";
import type { IPersonaCatalog } from "../../ports";

/**
 * File-based implementation of {@link IPersonaCatalog}.
 *
 * Reads persona definitions from markdown files in a configurable
 * directory. Each file's frontmatter (between `---` delimiters) is
 * parsed for `id` and `displayName`. The body is the system prompt.
 *
 * @example
 * ```ts
 * const catalog = new FilePersonaCatalog("persona");
 * const persona = await catalog.getPersona("chai");
 * const prompt = await catalog.getSystemPrompt("chai");
 * ```
 */
export class FilePersonaCatalog implements IPersonaCatalog {
  private readonly personasDir: string;

  /**
   * Create a new file-based persona catalog.
   *
   * @param personasDir - Absolute or project-relative path to persona files.
   *
   * @example
   * ```ts
   * const catalog = new FilePersonaCatalog(join(process.cwd(), "persona"));
   * ```
   */
  constructor(personasDir: string) {
    this.personasDir = personasDir;
  }

  /** {@inheritDoc IPersonaCatalog.getPersona} */
  async getPersona(personaId: string): Promise<IPersonaDefinition> {
    const filePath = join(this.personasDir, `${personaId}.md`);
    const content = await readFile(filePath, "utf-8");
    const { frontmatter } = this.parseFile(content);

    return {
      id: frontmatter.id ?? personaId,
      displayName: frontmatter.displayName ?? personaId,
      systemPromptPath: filePath,
    };
  }

  /** {@inheritDoc IPersonaCatalog.getSystemPrompt} */
  async getSystemPrompt(personaId: string): Promise<string> {
    const filePath = join(this.personasDir, `${personaId}.md`);
    const content = await readFile(filePath, "utf-8");
    const { body } = this.parseFile(content);
    return body.trim();
  }

  /**
   * List all available persona identifiers.
   *
   * Scans the personas directory for `.md` files and returns
   * their filenames (without extension) as persona IDs.
   *
   * @returns Array of persona identifiers.
   *
   * @example
   * ```ts
   * const ids = await catalog.listPersonaIds();
   * // ["chai", "espresso"]
   * ```
   */
  async listPersonaIds(): Promise<string[]> {
    const files = await readdir(this.personasDir);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => basename(f, ".md"));
  }

  /**
   * Parse a persona markdown file into frontmatter and body.
   *
   * Expects YAML-like frontmatter between `---` delimiters.
   *
   * @param content - The raw file content.
   * @returns Parsed frontmatter and body.
   */
  private parseFile(content: string): {
    frontmatter: Record<string, string>;
    body: string;
  } {
    const lines = content.split("\n");
    const frontmatter: Record<string, string> = {};
    let bodyStart = 0;

    if (lines[0]?.trim() === "---") {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i]?.trim() === "---") {
          bodyStart = i + 1;
          break;
        }
        const colonIndex = lines[i]?.indexOf(":");
        if (colonIndex !== undefined && colonIndex > 0) {
          const key = lines[i]!.slice(0, colonIndex).trim();
          const value = lines[i]!.slice(colonIndex + 1).trim();
          frontmatter[key] = value;
        }
      }
    }

    const body = lines.slice(bodyStart).join("\n");
    return { frontmatter, body };
  }
}
