import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(request) {
  try {
    // -----------------------------
    // Authenticate user
    // -----------------------------
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -----------------------------
    // Read request body
    // -----------------------------
    const body = await request.json();

    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    // -----------------------------
    // Validate passwords
    // -----------------------------
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: "New password is too long" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from the current password" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Get authenticated user
    // -----------------------------
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
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
        { error: "Password authentication is not configured for this account" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Verify current password
    // -----------------------------
    const passwordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // -----------------------------
    // Hash new password
    // -----------------------------
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // -----------------------------
    // Update password
    // -----------------------------
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);

    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}