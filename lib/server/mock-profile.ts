import type { AuthUser, StudentProfile } from "@/types";
import {
  createDefaultStudentProfile,
  normalizeProfile,
} from "@/lib/profile-utils";

type ProfileDatabase = {
  profiles: Record<string, StudentProfile>;
};

const globalForProfile = globalThis as unknown as {
  gradpilotProfileDb?: ProfileDatabase;
};

const db = globalForProfile.gradpilotProfileDb ?? {
  profiles: {},
};

if (!globalForProfile.gradpilotProfileDb) {
  globalForProfile.gradpilotProfileDb = db;
}

export function getProfileForUser(user: AuthUser): StudentProfile {
  const existingProfile = db.profiles[user.id];

  if (existingProfile) {
    return existingProfile;
  }

  const defaultProfile = normalizeProfile(createDefaultStudentProfile(user));
  db.profiles[user.id] = defaultProfile;

  return defaultProfile;
}

export function saveProfileForUser(
  user: AuthUser,
  profile: StudentProfile
): StudentProfile {
  const normalizedProfile = normalizeProfile({
    ...profile,
    id: `profile-${user.id}`,
    userId: user.id,
    email: user.email,
  });

  db.profiles[user.id] = normalizedProfile;

  return normalizedProfile;
}