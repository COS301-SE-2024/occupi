import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyledProvider, Theme } from '@gluestack-ui/themed';
import Onboarding2 from '../Onboarding2'; // Adjust the path to your component

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper'); // To prevent warnings about Animated module
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

const renderWithProvider = (component) => {
  return render(
    <StyledProvider theme={Theme}>
      {component}
    </StyledProvider>
  );
};

describe('Onboarding2 component', () => {
  it('renders correctly and matches snapshot', () => {
    const tree = renderWithProvider(<Onboarding2 />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders text correctly', () => {
    const { getByText } = renderWithProvider(<Onboarding2 />);
    expect(getByText('Day to day Occupancy analysis')).toBeTruthy();
    expect(getByText('Uses historical data to provide day to day analysis and statistics')).toBeTruthy();
  });

  it('navigates to the next screen on button press', () => {
    const { getByText } = renderWithProvider(<Onboarding2 />);
    const nextButton = getByText('Next');

    fireEvent.press(nextButton);

    expect(require('expo-router').router.replace).toHaveBeenCalledWith('/onboarding3');
  });
});
