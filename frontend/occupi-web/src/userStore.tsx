import { create } from "zustand";

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
  (set) => ({
    userDetails: null,
    setUserDetails: (details) => {
      set({ userDetails: details });
    },
  }),
);

// Hook for easier usage in components
export const useUser = () => {
  const store = useUserStore();
  return store;
};
