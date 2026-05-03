import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthSession } from "@/types";

type AuthStore = {
  session: AuthSession | null;

  /**
   * Hydration flags.
   * Some existing app files may use hasHydrated,
   * others may use isHydrated. Keep both to prevent infinite loading.
   */
  hasHydrated: boolean;
  isHydrated: boolean;

  setSession: (session: AuthSession) => void;
  login: (session: AuthSession) => void;

  clearSession: () => void;
  logout: () => void;

  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,

      hasHydrated: false,
      isHydrated: false,

      setSession: (session) => {
        set({ session });
      },

      login: (session) => {
        set({ session });
      },

      clearSession: () => {
        set({ session: null });
      },

      logout: () => {
        set({ session: null });
      },

      setHasHydrated: (value) => {
        set({
          hasHydrated: value,
          isHydrated: value,
        });
      },
    }),
    {
      name: "gradpilot-auth-session",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    }
  )
);
