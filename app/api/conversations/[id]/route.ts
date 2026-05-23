import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch conversation",
      },
      {
        status: 500,
      }
    );
  }
}