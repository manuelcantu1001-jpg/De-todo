export type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute(input: unknown): unknown;
};

declare global {
  interface Document {
    readonly modelContext?: {
      registerTool(
        tool: WebMcpTool,
        options?: { signal?: AbortSignal },
      ): void | Promise<void>;
    };
  }
}

export function registerWebMcpTool(tool: WebMcpTool) {
  const lifecycle = new AbortController();
  const context =
    typeof document === 'undefined' ? undefined : document.modelContext;
  if (!context?.registerTool) return () => lifecycle.abort();

  try {
    void Promise.resolve(
      context.registerTool(tool, { signal: lifecycle.signal }),
    ).catch((error: unknown) => {
      console.error(`No se pudo registrar la herramienta ${tool.name}.`, error);
    });
  } catch (error) {
    console.error(`No se pudo registrar la herramienta ${tool.name}.`, error);
  }

  return () => lifecycle.abort();
}
