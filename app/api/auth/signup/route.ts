import { NextRequest, NextResponse } from "next/server";
import { signupUser } from "@/lib/server/mock-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const session = signupUser({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      session,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to create account.",
      },
      { status: 400 }
    );
  }
}
