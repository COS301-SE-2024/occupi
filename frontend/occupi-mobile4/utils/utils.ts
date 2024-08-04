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