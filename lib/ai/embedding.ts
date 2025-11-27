import { embed, embedMany } from "ai";

const generateChunk = (input: string) => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

const embeddingModel = "openai/text-embedding-ada-002";

export const generateEmbeddings = async (texts: string) => {
  const chunks = generateChunk(texts);

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });

  return embeddings.map((e, i) => {
    return {
      content: chunks[i],
      embedding: e,
    };
  });
};
