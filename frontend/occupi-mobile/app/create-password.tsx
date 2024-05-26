import CreatePasswordScreen from "../screens/Login/CreatePassword";

import React from 'react';
import { StyledProvider } from '@gluestack-style/react'; // Import StyledProvider

export default function Home() {
  return (
    <StyledProvider config={undefined}>
      <CreatePasswordScreen />
    </StyledProvider>
  );
}
