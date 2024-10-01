import * as SecureStore from 'expo-secure-store';



export const getAccentColour = async () => {
    let accentcolour = await SecureStore.getItemAsync('accentColour');
    if (!accentcolour) {
        return "greenyellow";
    }
    else {
        return accentcolour;
    }
};

export const getTheme = async () => {
    let theme = await SecureStore.getItemAsync('Theme');
    if (!theme) {
        return "dark";
    }
    else {
        return theme;
    }
};

export const theme = getTheme();

export function extractDateFromTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }