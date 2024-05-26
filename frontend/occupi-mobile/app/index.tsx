import HomeScreen from '../screens/Login/SplashScreen';

import React from 'react';
import { StyledProvider } from '@gluestack-style/react'; // Import StyledProvider

export default function Home() {
  return (
    <StyledProvider config={undefined}>
      <HomeScreen />
    </StyledProvider>
  );
}
