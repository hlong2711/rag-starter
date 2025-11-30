import { NextResponse } from "next/server";
import { env } from "@/lib/env.mjs";
import { checkOllamaToolCapability } from "@/lib/ai/checkOllamaToolCapability";

export async function GET() {
  if (env.LLM_PROVIDER !== "ollama") {
    return NextResponse.json({
      isCapable: true,
      message: `Provider is ${env.LLM_PROVIDER}, not Ollama.`,
    });
  }

  const isCapable = await checkOllamaToolCapability(env.LLM_MODEL_ID);

  if (!isCapable) {
    return NextResponse.json({
      isCapable: false,
      message: `The selected Ollama model "${env.LLM_MODEL_ID}" may not support tool calling. Please use a model fine-tuned for tool calls.`,
    });
  }

  return NextResponse.json({
    isCapable: true,
    message: "Ollama model supports tool calling.",
  });
}
