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

export const maxDuration = 30; //seconds

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // model: "openai/gpt-4o", //ai gateway model
    model: google("gemini-2.5-flash-lite"),
    system: `You are a helpful assistant. Only respond to questions using information from tool calls. if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(2),
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        inputSchema: z.object({
          content: z
            .string()
            .min(1)
            .max(5000)
            .describe(
              "The content of the resource to add to the knowledge base."
            ),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
