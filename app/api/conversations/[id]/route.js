import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

const MAX_MESSAGES = 200;

// GET /api/conversations/[id]
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string" || id.length > 100) {
      return Response.json(
        {
          success: false,
          error: "Invalid conversation.",
        },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: MAX_MESSAGES,
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return Response.json(
        {
          success: false,
          error: "Conversation not found.",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        conversation,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    console.error("Conversation GET error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to load conversation.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  }
}
