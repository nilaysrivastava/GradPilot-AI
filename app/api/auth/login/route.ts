import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/server/mock-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const session = loginUser({
      email: body.email ?? "",
      password: body.password ?? "",
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully.",
      session,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to login.",
      },
      { status: 401 }
    );
  }
}
