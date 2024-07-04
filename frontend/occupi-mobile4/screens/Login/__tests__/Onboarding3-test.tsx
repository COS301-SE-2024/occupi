import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyledProvider, Theme } from '@gluestack-ui/themed';
import Onboarding3 from '../Onboarding3'; // Adjust the path to your component

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

describe('Onboarding3 component', () => {
  it('renders correctly and matches snapshot', () => {
    const tree = renderWithProvider(<Onboarding3 />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders text correctly', () => {
    const { getByText } = renderWithProvider(<Onboarding3 />);
    expect(getByText('Real time updates')).toBeTruthy();
    expect(getByText('Provides real time updates for occupancy and capacity')).toBeTruthy();
  });

  it('navigates to the welcome screen on button press', () => {
    const { getByText } = renderWithProvider(<Onboarding3 />);
    const nextButton = getByText('Next');

    fireEvent.press(nextButton);

    expect(require('expo-router').router.replace).toHaveBeenCalledWith('/welcome');
  });
});
