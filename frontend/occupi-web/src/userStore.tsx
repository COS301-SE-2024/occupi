import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserDetails {
  email: string;
  name: string;
  dob: string;
  gender: string;
  employeeid: string;
  number: string;
  pronouns: string;
  avatarId: string;
  position: string;
  departmentNo: string;
  // Add other fields as needed
}

interface UserStore {
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails | null) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userDetails: null,
      setUserDetails: (details) => {
        set({ userDetails: details });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Hook for easier usage in components
export const useUser = () => {
  const store = useUserStore();
  return store;
};
