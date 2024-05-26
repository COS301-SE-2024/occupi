import OtpVerificationScreen from "../screens/Login/OtpVerification";

import React from 'react';
import { StyledProvider } from '@gluestack-style/react'; // Import StyledProvider

export default function Home() {
  return (
    <StyledProvider config={undefined}>
      <OtpVerificationScreen />
    </StyledProvider>
  );
}
