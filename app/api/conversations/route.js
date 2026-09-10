import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

const MAX_CONVERSATIONS = 50;
const MAX_TITLE_LENGTH = 80;

// GET /api/conversations
// Returns the authenticated user's recent conversations.
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: MAX_CONVERSATIONS,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return Response.json(
      {
        success: true,
        conversations,
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
    console.error("Conversations GET error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to load conversations.",
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

// POST /api/conversations
// Creates a new empty conversation.
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    let title = body?.title?.trim() || "New Conversation";

    if (title.length > MAX_TITLE_LENGTH) {
      title = title.slice(0, MAX_TITLE_LENGTH);
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        conversation,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    console.error("Conversations POST error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to create conversation.",
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
