import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";
import { DB_VECTOR_DIMENSIONALITY } from "../config";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { embeddings } from "../db/schema/embeddings";
import { db } from "../db";

const generateChunk = (input: string) => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "")
    .map((i) => i.trim());
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

/** Generate single embedding */
export const generateEmbedding = async (texts: string) => {
  const chunks = texts.replaceAll("\\n", " ");

  const { embedding } = await embed({
    model: embeddingModel,
    value: chunks,
    providerOptions: {
      google: {
        taskType: "SEMANTIC_SIMILARITY",
        outputDimensionality: DB_VECTOR_DIMENSIONALITY,
      },
    },
  });

  return embedding;
};

export const findSimilarContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;

  const results = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);

  return results;
};
