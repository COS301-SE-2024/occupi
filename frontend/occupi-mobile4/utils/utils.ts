import * as SecureStore from 'expo-secure-store';

export const getAccentColour = async () => {
    let accentcolour = await SecureStore.getItemAsync('accentColour');
    if (!accentcolour) {
        return "greenyellow";
    }
    else
    {
        return accentcolour; 
    }
  };