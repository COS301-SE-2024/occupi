import SignupScreen from "../screens/Login/SignUp";

import React from 'react';
import { StyledProvider } from '@gluestack-style/react'; // Import StyledProvider

export default function Home() {
  return (
    <StyledProvider config={undefined}>
      <SignupScreen />
    </StyledProvider>
  );
}
