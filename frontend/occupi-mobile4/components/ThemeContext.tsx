// ThemeContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator, useColorScheme } from 'react-native';

// Define the shape of the context state
interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create a provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<string | null>(null); // Start with null to indicate loading

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const storedTheme = await SecureStore.getItemAsync('Theme');
                setTheme(storedTheme || 'light');
              } catch (error) {
                console.error('Failed to load theme from SecureStore:', error);
                setTheme('light');
              }
        };

        fetchTheme();
    }, []);

    const updateTheme = async (newTheme: string) => {
        console.log('updating theme');
        try {
            await SecureStore.setItemAsync('Theme', newTheme);
            setTheme(newTheme);
        } catch (error) {
            console.error('Failed to save theme to SecureStore:', error);
        }
    };

    if (theme === null) {
        // Show a loading spinner while the theme is being fetched
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the ThemeContext
export const useTheme = (): ThemeContextType => {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
