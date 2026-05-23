export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResponse = {
  reply: string;

  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export interface LLMProvider {
  generateResponse(
    messages: ChatMessage[]
  ): Promise<ChatResponse>;
}