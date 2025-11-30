import { env } from "@/lib/env.mjs";

interface OllamaModelDetails {
  // Add relevant fields from Ollama /api/show response
  // For example, if there's a 'details' or 'parameters' field
  // For now, we'll assume there might be a 'family' or 'general_info'
  details?: {
    family?: string;
  };
  license?: string;
  modelfile?: string;
  parameters?: string; // This might contain hints
  template?: string; // Could indicate chat template
  capabilities?: (
    | "completion"
    | "tools"
    | "vision"
    | "thinking"
    | "embedding"
  )[]; // Hypothetical field for capabilities
}

/**
 * Heuristically checks if an Ollama model might have "tools capability"
 * based on its details. Since Ollama API doesn't expose a direct flag for this,
 * this function looks for keywords in the model's description/template
 * that suggest instruction-following or chat capabilities.
 *
 * @param modelId The ID of the Ollama model (e.g., "llama2", "mixtral:latest").
 * @returns A boolean indicating if the model is likely tool-capable.
 */
export const checkOllamaToolCapability = async (
  modelId: string
): Promise<boolean> => {
  const ollamaBaseUrl = env.OLLAMA_BASE_URL;
  const showUrl = `${ollamaBaseUrl}/api/show`;

  try {
    const response = await fetch(showUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: modelId }),
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch details for model ${modelId}: ${response.statusText}`
      );
      return false;
    }

    const data: OllamaModelDetails = await response.json();
    console.log(`Ollama model details for ${modelId}:`, data.capabilities);
    

    return !!data.capabilities && data.capabilities.includes("tools");
  } catch (error) {
    console.error(
      `Error checking Ollama model capability for ${modelId}:`,
      error
    );
    return false;
  }
};
