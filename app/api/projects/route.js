import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

// GET /api/projects
export async function GET() {
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

    const projects = await prisma.project.findMany({
      where: {
        ownerId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            findings: true,
          },
        },
      },
    });

    return Response.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Projects GET error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to load projects.",
      },
      { status: 500 }
    );
  }
}


// POST /api/projects
export async function POST(request) {
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

    const body = await request.json();

    const name = body?.name?.trim();
    const description = body?.description?.trim() || null;

    if (!name) {
      return Response.json(
        {
          success: false,
          error: "Project name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        {
          success: false,
          error: "Project name must be 100 characters or less.",
        },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
      },
      include: {
        _count: {
          select: {
            findings: true,
          },
        },
      },
    });

    return Response.json(
      {
        success: true,
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Projects POST error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create project.",
      },
      { status: 500 }
    );
  }
}