import { google } from "@ai-sdk/google";
import { ollama } from "ollama-ai-provider-v2";

type Provider = "google" | "openai" | "ollama";

export const createModel = (provider: Provider, modelId: string) => {
  switch (provider) {
    case "google":
      return google(modelId);
    // case "openai":
    //   return openai(modelId as any);
    case "ollama":
      return ollama(modelId);

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};
