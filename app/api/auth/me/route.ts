import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/server/mock-auth";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing auth token.",
      },
      { status: 401 }
    );
  }

  const user = getUserFromToken(token);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Session expired or invalid.",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "User session is active.",
    user,
  });
}
