import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("Settings GET error:", error);

    return NextResponse.json(
      { error: "Failed to load account settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    /*
     * SECURITY:
     * Account settings only allow changing the display name.
     *
     * Email is intentionally immutable through this endpoint.
     */
    if (
      body === null ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    /*
     * Reject email modification attempts explicitly.
     *
     * This prevents someone from bypassing the UI and sending:
     *
     * {
     *   "email": "someone@example.com"
     * }
     */
    if (Object.prototype.hasOwnProperty.call(body, "email")) {
      return NextResponse.json(
        {
          error:
            "Email address cannot be changed from account settings",
        },
        { status: 403 }
      );
    }

    /*
     * Reject unknown fields as well.
     *
     * Only:
     *
     * {
     *   name: "..."
     * }
     *
     * is accepted.
     */
    const allowedFields = ["name"];

    const unknownFields = Object.keys(body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (unknownFields.length > 0) {
      return NextResponse.json(
        {
          error: "Unsupported account setting",
        },
        { status: 400 }
      );
    }

    if (!Object.prototype.hasOwnProperty.call(body, "name")) {
      return NextResponse.json(
        { error: "No changes provided" },
        { status: 400 }
      );
    }

    let { name } = body;

    /*
     * Validate name.
     */
    if (typeof name !== "string") {
      return NextResponse.json(
        { error: "Name must be a string" },
        { status: 400 }
      );
    }

    name = name.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error:
            "Name must be 100 characters or less",
        },
        { status: 400 }
      );
    }

    /*
     * Update ONLY the authenticated user's own record.
     *
     * Never accept a userId from the client.
     */
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Account updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Settings PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update account settings" },
      { status: 500 }
    );
  }
}