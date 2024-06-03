import React, { useState, useEffect, createContext, useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Login/SplashScreen';
import LoginScreen from '../screens/Login/SignIn';
import SignupScreen from '../screens/Login/SignUp';
import WelcomeScreen from '../screens/Login/WelcomeScreen';
import ForgotPasswordScreen from '../screens/Login/ForgotPassword';
import VerifyOTPScreen from '../screens/Login/OtpVerification';
import CreatePasswordScreen from '../screens/Login/CreatePassword';
import EditProfileScreen from '../screens/Login/EditProfile';
import ProfileScreen from '../screens/Profile/Profile';
import SettingsScreen from '../screens/Profile/Settings';
import BookingsScreen from '../screens/Dashboard/Bookings';
import Onboarding1Screen from '../screens/Login/Onboarding1';
import Onboarding2Screen from '../screens/Login/Onboarding2';
import Onboarding3Screen from '../screens/Login/Onboarding3';
import HomeScreen from '../screens/Dashboard/Home';

import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

const RootLayoutNav = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={theme === 'dark' ? eva.dark : eva.light}>
        <Stack.Navigator initialRouteName="index">
          <Stack.Screen name="index" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="welcome-screen" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="verify-otp" component={VerifyOTPScreen} options={{ headerShown: false }} />
          <Stack.Screen name="create-password" component={CreatePasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" component={EditProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="settings" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="bookings" component={BookingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="onboarding1" component={Onboarding1Screen} options={{ headerShown: false }} />
        <Stack.Screen name="onboarding2" component={Onboarding2Screen} options={{ headerShown: false }} />
        <Stack.Screen name="home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="onboarding3" component={Onboarding3Screen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </ApplicationProvider>
    </ThemeContext.Provider>
  );
};

export default RootLayoutNav;