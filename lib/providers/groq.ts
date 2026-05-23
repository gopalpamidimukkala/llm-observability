import OpenAI from "openai";

import { ChatMessage, ChatResponse, LLMProvider } from "./types";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export class GroqProvider implements LLMProvider {
  async generateResponse(messages: ChatMessage[]): Promise<ChatResponse> {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
    });

    return {
      reply: completion.choices[0].message.content || "",

      usage: {
        promptTokens: completion.usage?.prompt_tokens,

        completionTokens: completion.usage?.completion_tokens,

        totalTokens: completion.usage?.total_tokens,
      },
    };
  }
}
