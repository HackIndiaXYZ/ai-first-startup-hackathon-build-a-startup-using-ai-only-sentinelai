import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

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

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Project ID is required.",
        },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
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

    if (!project) {
      return Response.json(
        {
          success: false,
          error: "Project not found.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Project GET error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to load project.",
      },
      { status: 500 }
    );
  }
}