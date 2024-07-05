import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingGradientButton from '../LoadingGradientButton';

describe('LoadingGradientButton', () => {
  it('renders the gradient with the correct colors and locations', () => {
    const { getByTestId } = render(<LoadingGradientButton />);
    const linearGradient = getByTestId('gradient-loading-button').props;

    // Numeric color values
    const expectedColors = [4284566984, 4287032268, 4289920058, 4293849184];
    
    expect(linearGradient.colors).toEqual(expectedColors);
    expect(linearGradient.locations).toEqual([0.02, 0.31, 0.67, 0.97]);
  });

  it('renders an ActivityIndicator with the correct properties', () => {
    const { getByTestId } = render(<LoadingGradientButton />);
    const activityIndicator = getByTestId('loading-indicator');

    expect(activityIndicator).toBeTruthy();
    expect(activityIndicator.props.size).toBe('small');
    expect(activityIndicator.props.color).toBe('#000');
  });
});
    