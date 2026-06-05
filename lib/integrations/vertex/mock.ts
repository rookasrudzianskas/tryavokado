import type { ModelUsage, VertexAdapter } from "../types";

/**
 * Labelled mock Vertex adapter. Returns the caller-provided fixture (validated)
 * so the whole brand/creative/recommendation pipeline works with no GCP project.
 */
export class MockVertexAdapter implements VertexAdapter {
  readonly mode = "mock" as const;

  private usage(model: string): ModelUsage {
    return { inputTokens: 512, outputTokens: 384, latencyMs: 40, model };
  }

  async generateText(input: {
    prompt: string;
    system?: string;
    model?: string;
  }): Promise<{ text: string; usage: ModelUsage }> {
    const model = input.model ?? "mock-gemini";
    return {
      text:
        "This is labelled demo output from the mock Vertex adapter. Configure a Google Cloud project to generate real analysis.",
      usage: this.usage(model),
    };
  }

  async generateStructured<T>(input: {
    prompt: string;
    system?: string;
    model?: string;
    validate: (value: unknown) => T;
    mockValue: T;
  }): Promise<{ data: T; usage: ModelUsage }> {
    // Validate the fixture against the caller's schema so mock output is always
    // shape-compatible with what the live adapter would return.
    const data = input.validate(input.mockValue);
    return { data, usage: this.usage(input.model ?? "mock-gemini") };
  }
}
