"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import {
  SendHorizonal,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();
  const [expandedTools, setExpandedTools] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const checkModelCapability = async () => {
      try {
        const response = await fetch("/api/check-model");
        const data = await response.json();
        if (!data.isCapable) {
          setWarning(data.message);
        }
      } catch (error) {
        console.error("Failed to check model capability:", error);
      }
    };

    checkModelCapability();
  }, []);

  const toggleTool = (id: string) => {
    setExpandedTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    console.log(`=>>>> chat messages: `, messages);
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 antialiased">
      {warning && (
        <Alert variant="destructive" className="rounded-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg shadow-md ${
                  m.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                <div className="font-semibold capitalize mb-1">
                  {m.role === "user" ? "You" : "AI"}
                </div>
                {m.parts.map((part, index) => {
                  const toolId = `${m.id}-${index}`;
                  const isExpanded = expandedTools[toolId];

                  switch (part.type) {
                    case "text":
                      return <p key={index}>{part.text}</p>;

                    case "tool-addResource":
                    case "tool-getInformation":
                      return (
                        <div key={index} className="text-sm mt-2">
                          <button
                            onClick={() => toggleTool(toolId)}
                            className="w-full flex justify-between items-center text-left font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 focus:outline-none"
                          >
                            <span>
                              {part.state === "output-available"
                                ? "Called"
                                : "Calling"}{" "}
                              tool:{" "}
                              <span className="font-mono text-gray-700">
                                {part.type.replace("tool-", "")}
                              </span>
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 p-2 bg-gray-100 rounded-b-lg">
                              <h4 className="font-medium mt-2">Input:</h4>
                              <pre className="my-2 bg-white text-gray-700 p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(part.input, null, 2)}
                              </pre>
                              {part.state === "output-available" && (
                                <>
                                  <h4 className="font-medium mt-2">Output:</h4>
                                  <pre className="my-2 bg-white text-gray-700 p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(part.output, null, 2)}
                                  </pre>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="sticky bottom-0 bg-gray-50 p-4 sm:p-6 border-t border-gray-200"
      >
        <div className="max-w-3xl mx-auto flex items-center space-x-2">
          <input
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.currentTarget.value)}
          />
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={!input.trim()}
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

