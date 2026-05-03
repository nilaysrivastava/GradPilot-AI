"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { StudentProfile } from "@/types";

type ProfileState = {
  profile: StudentProfile | null;
  setProfile: (profile: StudentProfile) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "gradpilot-student-profile",
    }
  )
);