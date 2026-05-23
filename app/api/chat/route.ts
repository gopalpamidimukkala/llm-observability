import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateChatResponse } from "@/lib/llm-wrapper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { message, conversationId } = body;

    let conversation;

    // Create conversation if not exists
    if (!conversationId) {
      conversation = await prisma.conversation.create({
        data: {
          title:
            message.length > 30 ? message.replace(/\n/g, " ").slice(0, 40) + "..." : message,
        },
      });
    } else {
      conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          messages: true,
        },
      });
    }

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Fetch latest messages for context
    const previousMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 10,
    });

    // Convert to groq format
    const formattedMessages = previousMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const assistantReply = await generateChatResponse({
      conversationId: conversation.id,
      messages: formattedMessages,
    });

    // Save assistant response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: assistantReply,
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      reply: assistantReply,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
