import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    // Basic validation
    if (!name || !email || !password) {
      return Response.json(
        {
          success: false,
          error: "Name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        {
          success: false,
          error: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create account
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create account.",
      },
      { status: 500 }
    );
  }
}