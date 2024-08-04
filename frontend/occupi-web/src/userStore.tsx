import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        // Optional: Log when hydration starts
        console.log('Hydration starts')
        
        // Return a function that will be called when hydration finishes
        return (state, error) => {
          if (error) {
            console.log('An error happened during hydration', error)
          } else {
            console.log('Hydration finished')
          }
        }
      },
    }
  )
)

// Hook for easier usage in components
export const useUser = () => {
  const store = useUserStore()
  console.log('Current userDetails:', store.userDetails)
  return store
}