import { convertToModelMessages, streamText, UIMessage } from "ai";

import { google } from "@ai-sdk/google";

export const maxDuration = 30; //seconds

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // model: "openai/gpt-4o", //ai gateway model
    model: google("gemini-2.5-flash-lite"),
    system: `You are a helpful assistant. Only respond to questions using information from tool calls. if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
