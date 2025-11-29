"use server";

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from "@/lib/db/schema/resources";
import { db } from "../db";
import { generateEmbeddings } from "../ai/embedding";
import { embeddings as embeddingTable } from "@/lib/db/schema/embeddings";
import { and, count, eq } from "drizzle-orm";

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content, title } = insertResourceSchema.parse(input);

    const [resource] = await db
      .insert(resources)
      .values({ content, title })
      .returning();

    const embeddings = await generateEmbeddings(content);

    await db.insert(embeddingTable).values(
      embeddings.map((e) => ({
        resourceId: resource.id,
        ...e,
      }))
    );

    return "Resource successfully created.";
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : "Error, please try again.";
  }
};

export const getResources = async (page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize;
  const [total] = await db.select({ value: count() }).from(resources);
  const resourceList = await db
    .select()
    .from(resources)
    .limit(pageSize)
    .offset(offset);

  return {
    data: resourceList,
    total: total.value,
  };
};

export const deleteResource = async (id: string) => {
  try {
    await db.transaction(async (tx) => {
      // await tx.delete(embeddingTable).where(eq(embeddingTable.resourceId, id));
      await tx.delete(resources).where(eq(resources.id, id));
    });
    return "Resource successfully deleted.";
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : "Error, please try again.";
  }
};

