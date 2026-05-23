import { getProvider } from "./providers";

type ChatParams = {
  conversationId: string;
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
  provider?: string;
};

export async function generateChatResponse({
  conversationId,
  messages,
  provider,
}: ChatParams) {
  const start = Date.now();

  try {
    const providerInstance = getProvider(provider || "groq");

    const response = await providerInstance.generateResponse(messages);

    const latencyMs = Date.now() - start;

    await fetch(`${process.env.APP_URL}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,

        provider: provider || "groq",

        model: "llama-3.3-70b-versatile",

        latencyMs,

        promptTokens: response.usage?.promptTokens,

        completionTokens: response.usage?.completionTokens,

        totalTokens: response.usage?.totalTokens,

        status: "success",

        inputPreview: JSON.stringify(messages.slice(-2)),

        outputPreview: response.reply.slice(0, 200),
      }),
    });

    return response.reply;
  } catch (error: any) {
    const latencyMs = Date.now() - start;

    // Log failed inference
    await fetch(`${process.env.APP_URL}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,

        provider: "groq",
        model: "llama-3.3-70b-versatile",

        latencyMs,

        status: "error",

        error: error.message,
      }),
    });

    throw error;
  }
}
