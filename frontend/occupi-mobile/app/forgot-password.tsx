import React from 'react';
import { StyledProvider } from '@gluestack-style/react'; // Import StyledProvider
import ForgotPasswordScreen from '../screens/Login/ForgotPassword';

export default function Home() {
  return (
    <StyledProvider config={undefined}>
      <ForgotPasswordScreen />
    </StyledProvider>
  );
}
