"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type Message = {
  role: string;
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");

  const [conversationId, setConversationId] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");

      const data = await res.json();

      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, []);

  async function loadConversation(id: string) {
    try {
      const res = await fetch(`/api/conversations/${id}`);

      const data = await res.json();

      setConversationId(id);

      setMessages(data.messages);
    } catch (error) {
      console.error(error);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    try {
      setLoading(true);

      const userMessage = {
        role: "user",
        content: input,
      };

      setMessages((prev) => [...prev, userMessage]);

      const currentInput = input;

      setInput("");

      const res = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: currentInput,
          conversationId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate response");
      }
      const data = await res.json();

      if (!conversationId) {
        setConversationId(data.conversationId);

        fetchConversations();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function newConversation() {
    setConversationId("");
    setMessages([]);
  }

  return (
    <main className="flex h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Sidebar */}
      <div className="w-60 border-r border-zinc-200 bg-white dark:bg-zinc-950 p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-semibold text-lg">LLM Observability</h1>

            <p className="text-xs text-zinc-500">
              AI inference monitoring platform
            </p>
          </div>

          <ThemeToggle />
        </div>

        {/* New Chat Button */}
        <button
          onClick={newConversation}
          className="w-full bg-black dark:bg-white dark:text-black text-white py-2 rounded-xl mb-4 hover:opacity-90 transition"
        >
          <div className="flex items-center pl-3 gap-6 justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-square-pen "
            >
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
            </svg>

            <span>New Chat</span>
          </div>
        </button>

        {/* Conversations Button */}
        <div className="space-y-2 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => loadConversation(conversation.id)}
              className={`w-full text-left p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition truncate text-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 ${
                conversationId === conversation.id
                  ? "bg-zinc-100 dark:bg-zinc-900"
                  : ""
              }`}
            >
              {conversation.title || "New Chat"}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-black">
        {/* Top Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <h1 className="text-xl font-semibold">AI Observability Assistant</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Multi-provider AI observability system
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-zinc-500">
              Start a conversation with the AI assistant
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-7 whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 flex gap-2 bg-white dark:bg-black">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 border border-zinc-300 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 outline-none shadow-sm"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-black dark:bg-white dark:text-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
}
