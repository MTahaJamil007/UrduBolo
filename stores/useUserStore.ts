import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserStore {
  name: string | null;
  genderPreference: "m" | "f" | "prefer-not-to-say" | null;
  setProfile: (name: string, gender: "m" | "f" | "prefer-not-to-say") => void;
  resetUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: null,
      genderPreference: null,
      setProfile: (name, gender) => set({ name, genderPreference: gender }),
      resetUser: () => set({ name: null, genderPreference: null }),
    }),
    {
      name: "bolo-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
