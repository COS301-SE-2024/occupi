import { create } from 'zustand'
import { persist, PersistStorage } from 'zustand/middleware'

interface UserDetails {
  email: string;
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
        console.log("Setting user details in store:", details);
        set({ userDetails: details })
      },
    }),
    {
      name: 'user-storage',
      storage: typeof window !== 'undefined' ? (window.localStorage as unknown as PersistStorage<UserStore>) : undefined,
    }
  )
)

// Hook for easier usage in components
export const useUser = () => useUserStore((state) => ({
  userDetails: state.userDetails,
  setUserDetails: state.setUserDetails
}))