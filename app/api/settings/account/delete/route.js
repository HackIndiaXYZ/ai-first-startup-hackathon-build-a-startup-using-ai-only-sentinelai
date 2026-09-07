import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "../../../../../auth";
import { prisma } from "../../../../../lib/prisma";

export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body = {};

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

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

    const { currentPassword, confirmation } = body;

    if (
      typeof currentPassword !== "string" ||
      !currentPassword
    ) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 }
      );
    }

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        {
          error:
            'Type "DELETE" to confirm account deletion',
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            "Password authentication is unavailable for this account",
        },
        { status: 400 }
      );
    }

    const passwordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);

    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}