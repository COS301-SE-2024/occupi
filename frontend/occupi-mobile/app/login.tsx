import LoginScreen from "../screens/Login/SignIn";

import React from 'react';
import { StyledProvider } from '@gluestack-style/react'; // Import StyledProvider

export default function Home() {
  return (
    <StyledProvider config={undefined}>
      <LoginScreen />
    </StyledProvider>
  );
}
