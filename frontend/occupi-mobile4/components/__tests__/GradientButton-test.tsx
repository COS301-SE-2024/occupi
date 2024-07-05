import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GradientButton from '../GradientButton';

describe('GradientButton', () => {
  it('renders correctly with the given text', () => {
    const { getByText } = render(<GradientButton text="Click Me" />);
    const buttonText = getByText('Click Me');
    expect(buttonText).toBeTruthy();
  });

  it('calls the onPress function when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<GradientButton text="Click Me" onPress={onPressMock} />);
    const buttonText = getByText('Click Me');
    fireEvent.press(buttonText);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('has the correct gradient colors', () => {
    const { getByTestId } = render(<GradientButton text="Click Me" />);
    const linearGradient = getByTestId('gradient-button').props;

    // Numeric color values
    const expectedColors = [4284566984, 4287032268, 4289920058, 4293849184];
    
    expect(linearGradient.colors).toEqual(expectedColors);
    expect(linearGradient.locations).toEqual([0.02, 0.31, 0.67, 0.97]);
  });
});
