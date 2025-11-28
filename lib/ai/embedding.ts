import { google } from "@ai-sdk/google";
import { embedMany } from "ai";
import { DB_VECTOR_DIMENSIONALITY } from "../config";

const generateChunk = (input: string) => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

// const embeddingModel = "openai/text-embedding-ada-002";

const embeddingModel = google.textEmbedding("gemini-embedding-001");

export const generateEmbeddings = async (texts: string) => {
  const chunks = generateChunk(texts);

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
    providerOptions: {
      google: {
        taskType: "SEMANTIC_SIMILARITY",
        outputDimensionality: DB_VECTOR_DIMENSIONALITY,
      },
    },
  });

  return embeddings.map((e, i) => {
    return {
      content: chunks[i],
      embedding: e,
    };
  });
};
