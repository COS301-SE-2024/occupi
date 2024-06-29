import React from 'react';
import { screen,render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Onboarding1 from '../Onboarding1';
import Onboarding2 from '../Onboarding2';
import Onboarding3 from '../Onboarding3';
import Welcome from '../Welcome';
import '@testing-library/jest-native/extend-expect';

const Stack = createStackNavigator();

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Onboarding1" component={Onboarding1} />

      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      <Stack.Screen name="Welcome" component={Welcome} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Onboarding Flow Integration', () => {
  it('navigates through all onboarding screens to the welcome screen', async () => {
    const { findByText, findByTestId } = render(<TestNavigator />);

    // Onboarding1
    const capacityPrediction = await findByTestId('capacity-prediction-heading');
    expect(capacityPrediction).toBeTruthy();
    expect(capacityPrediction.props.children).toBe('Capacity Prediction');
    
    const nextButton = await findByText('Next');
    fireEvent.press(nextButton);
    // Onboarding2
    const occupancyAnalysis = await findByText('Day to day Occupancy analysis');
    expect(occupancyAnalysis).toBeTruthy();
    fireEvent.press(await findByText('Next'));

    // Onboarding3
    const realTimeUpdates = await findByText('Real time updates');
    expect(realTimeUpdates).toBeTruthy();
    fireEvent.press(await findByText('Next'));

    // Welcome
    const loginText = await findByText("Log in. Let's Plan.");
    expect(loginText).toBeTruthy();
    expect(await findByText('Predict. Plan. Perfect.')).toBeTruthy();
    expect(await findByText('Login')).toBeTruthy();
    expect(await findByText('Register')).toBeTruthy();
  });
});