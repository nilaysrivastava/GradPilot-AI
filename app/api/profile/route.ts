import { NextRequest, NextResponse } from "next/server";

import { getUserFromToken } from "@/lib/server/mock-auth";
import {
  getProfileForUser,
  saveProfileForUser,
} from "@/lib/server/mock-profile";
import type { AuthUser } from "@/types";

function getToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "");
}

function getFallbackUser(request: NextRequest): AuthUser | null {
  const rawUser = request.headers.get("x-gradpilot-user");

  if (!rawUser) {
    return null;
  }

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

  return NextResponse.json({
    success: true,
    message: "Profile fetched successfully.",
    profile,
  });
}

export async function PUT(request: NextRequest) {
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

  try {
    const body = await request.json();
    const savedProfile = saveProfileForUser(user, body.profile);

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully.",
      profile: savedProfile,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to save profile.",
      },
      { status: 400 }
    );
  }
}
