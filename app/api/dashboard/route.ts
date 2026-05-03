import { NextRequest, NextResponse } from "next/server";

import { buildDashboardInsights } from "@/lib/dashboard-insights";
import { getUserFromToken } from "@/lib/server/mock-auth";
import { getProfileForUser } from "@/lib/server/mock-profile";
import type { AuthUser, StudentProfile } from "@/types";

function getToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "");
}

function getFallbackUser(request: NextRequest): AuthUser | null {
  const rawUser = request.headers.get("x-gradpilot-user");

  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as AuthUser;

    if (!user.id || !user.email || !user.name) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

function resolveUser(request: NextRequest): AuthUser | null {
  const token = getToken(request);

  if (token) {
    const userFromToken = getUserFromToken(token);

    if (userFromToken) {
      return userFromToken;
    }
  }

  return getFallbackUser(request);
}

export async function GET(request: NextRequest) {
  const user = resolveUser(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Session expired. Please login again.",
      },
      { status: 401 }
    );
  }

  const profile = getProfileForUser(user);
  const insights = buildDashboardInsights(profile);

  return NextResponse.json({
    success: true,
    message: "Dashboard insights generated successfully.",
    insights,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = body.profile as StudentProfile;
    const insights = buildDashboardInsights(profile);

    return NextResponse.json({
      success: true,
      message: "Dashboard insights generated from client profile.",
      insights,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate dashboard insights.",
      },
      { status: 400 }
    );
  }
}
