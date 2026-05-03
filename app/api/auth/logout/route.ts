import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/server/mock-auth";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    logoutUser(token);
  }

  return NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
}
