import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const log = await prisma.inferenceLog.create({
      data: {
        conversationId: body.conversationId,
        provider: body.provider,
        model: body.model,
        latencyMs: body.latencyMs,
        promptTokens: body.promptTokens,
        completionTokens: body.completionTokens,
        totalTokens: body.totalTokens,
        status: body.status,
        error: body.error,
        inputPreview: body.inputPreview,
        outputPreview: body.outputPreview,
      },
    });

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to ingest log",
      },
      {
        status: 500,
      }
    );
  }
}