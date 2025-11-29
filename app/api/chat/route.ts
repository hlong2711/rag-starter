import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";

import { google } from "@ai-sdk/google";
import z from "zod";
import { createResource } from "@/lib/actions/resources";
import { findSimilarContent } from "@/lib/ai/embedding";

export const maxDuration = 30; //seconds

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // model: "openai/gpt-4o", //ai gateway model
    model: google("gemini-2.5-flash"),
    system: `You are a helpful assistant. Only respond to questions using information from tool calls. 
    **Tool Utilization:**
     - Automatically invoke the \`getInformation\` tool when additional information is required to answer a question accurately, especially in unclear or complex queries.
     - Integrate the retrieved information seamlessly into the response without notifying the user explicitly.

    If no relevant information is found in the tool calls, respond, "Sorry, I don't know.".
    `,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        inputSchema: z.object({
          title: z
            .string()
            .max(255)
            .describe(
              "The title of the resource. If not provided, it will default to 'Untitled Resource'."
            ),
          content: z
            .string()
            .min(1)
            .max(5000)
            .describe(
              "The content of the resource to add to the knowledge base."
            ),
        }),
        execute: async ({ title, content }) =>
          createResource({ title, content }),
      }),

      getInformation: tool({
        description: `get information from your knowledge base to answer user questions. After using this tool, use the information retrieved to answer the user's question.`,
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "The user's question or query to search for. If user ask in non-English, translate it to English first (to improve search quality), then search."
            ),
        }),
        execute: async ({ query }) => findSimilarContent(query),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
