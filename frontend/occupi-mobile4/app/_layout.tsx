import React, { useEffect } from 'react';
import { useColorScheme as rnUseColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { NavBarProvider } from '@/components/NavBarProvider';
import { config } from "@gluestack-ui/config"; // Optional if you want to use default theme

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = rnUseColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <GluestackUIProvider config={config} theme={theme}>
      <NavBarProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="create-password" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="bookings" options={{ headerShown: false }} />
        <Stack.Screen name="viewbookings" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding1" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding2" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding3" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="office-details" options={{ headerShown: false }} />
        <Stack.Screen name="booking-details" options={{ headerShown: false }} />
        <Stack.Screen name="viewbookingdetails" options={{ headerShown: false }} />
        <Stack.Screen name="faqpage" options={{ headerShown: false }} />
        <Stack.Screen name="set-details" options={{ headerShown: false }} />
        <Stack.Screen name="set-notifications" options={{ headerShown: false }} />
        <Stack.Screen name="set-security" options={{ headerShown: false }} />
        <Stack.Screen name="set-appearance" options={{ headerShown: false }} />
        <Stack.Screen name="notiftester" options={{ headerShown: false }} />
        <Stack.Screen name="changepassword" options={{ headerShown: false }} />
      </Stack>
      </NavBarProvider>
    </GluestackUIProvider>
  );
}