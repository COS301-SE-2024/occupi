import { useEffect, useState } from "react";
import Dashboard from "../screens/Dashboard/Dashboard";
import * as SecureStore from 'expo-secure-store';




export default function Home() {
    const [theme, setTheme] = useState<string>('');

    useEffect(() => {
        const getAccentColour = async () => {
            let theme = await SecureStore.getItemAsync('Theme');
            setTheme(theme);
        };
        getAccentColour();
    }, []);
    return (
        <Dashboard theme={theme as string} />
    );
}