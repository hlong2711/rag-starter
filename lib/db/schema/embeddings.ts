import { pgTable, varchar, text, vector, index } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { resources } from "./resources";
import { DB_VECTOR_DIMENSIONALITY } from "@/lib/config";

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 })
      .references(() => resources.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", {
      dimensions: DB_VECTOR_DIMENSIONALITY,
    }).notNull(),
  },
  (table) => ({
    embeddingIndex: index("embeddings_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);
