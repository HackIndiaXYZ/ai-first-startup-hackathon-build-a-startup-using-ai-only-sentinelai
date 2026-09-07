import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

const ALLOWED_THEMES = ["dark", "system"];
const ALLOWED_RESPONSE_STYLES = ["concise", "balanced", "detailed"];

async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let settings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        theme: true,
        compactMode: true,
        animations: true,
        responseStyle: true,
        securityMode: true,
        workspaceContext: true,
        codeExamples: true,
      },
    });

    // Create defaults automatically for existing users.
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
        },
        select: {
          theme: true,
          compactMode: true,
          animations: true,
          responseStyle: true,
          securityMode: true,
          workspaceContext: true,
          codeExamples: true,
        },
      });
    }

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    console.error("Preferences GET error:", error);

    return NextResponse.json(
      { error: "Failed to load preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const data = {};

    /* ---------------------------------------------------------------------- */
    /* APPEARANCE                                                             */
    /* ---------------------------------------------------------------------- */

    if (body.theme !== undefined) {
      if (
        typeof body.theme !== "string" ||
        !ALLOWED_THEMES.includes(body.theme)
      ) {
        return NextResponse.json(
          { error: "Invalid theme" },
          { status: 400 }
        );
      }

      data.theme = body.theme;
    }

    if (body.compactMode !== undefined) {
      if (typeof body.compactMode !== "boolean") {
        return NextResponse.json(
          { error: "compactMode must be a boolean" },
          { status: 400 }
        );
      }

      data.compactMode = body.compactMode;
    }

    if (body.animations !== undefined) {
      if (typeof body.animations !== "boolean") {
        return NextResponse.json(
          { error: "animations must be a boolean" },
          { status: 400 }
        );
      }

      data.animations = body.animations;
    }

    /* ---------------------------------------------------------------------- */
    /* AI                                                                      */
    /* ---------------------------------------------------------------------- */

    if (body.responseStyle !== undefined) {
      if (
        typeof body.responseStyle !== "string" ||
        !ALLOWED_RESPONSE_STYLES.includes(body.responseStyle)
      ) {
        return NextResponse.json(
          { error: "Invalid response style" },
          { status: 400 }
        );
      }

      data.responseStyle = body.responseStyle;
    }

    if (body.securityMode !== undefined) {
      if (typeof body.securityMode !== "boolean") {
        return NextResponse.json(
          { error: "securityMode must be a boolean" },
          { status: 400 }
        );
      }

      data.securityMode = body.securityMode;
    }

    if (body.workspaceContext !== undefined) {
      if (typeof body.workspaceContext !== "boolean") {
        return NextResponse.json(
          { error: "workspaceContext must be a boolean" },
          { status: 400 }
        );
      }

      data.workspaceContext = body.workspaceContext;
    }

    if (body.codeExamples !== undefined) {
      if (typeof body.codeExamples !== "boolean") {
        return NextResponse.json(
          { error: "codeExamples must be a boolean" },
          { status: 400 }
        );
      }

      data.codeExamples = body.codeExamples;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid changes provided" },
        { status: 400 }
      );
    }

    const settings = await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },

      create: {
        userId: user.id,
        ...data,
      },

      update: data,

      select: {
        theme: true,
        compactMode: true,
        animations: true,
        responseStyle: true,
        securityMode: true,
        workspaceContext: true,
        codeExamples: true,
      },
    });

    return NextResponse.json({
      message: "Preferences updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Preferences PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}