import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GradientButton from '../GradientButton';

// Mock the dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn((val) => val),
  heightPercentageToDP: jest.fn((val) => val),
}));

jest.mock('@gluestack-ui/themed', () => ({
  Heading: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

describe('GradientButton', () => {
  it('renders correctly with the given text', () => {
    const { getByTestId } = render(<GradientButton text="Click Me" onPress={undefined} />);
    const button = getByTestId('gradient-button');
    expect(button).toBeTruthy();
    expect(button.props.children.props.children).toBe('Click Me');
  });

  it('calls the onPress function when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<GradientButton text="Click Me" onPress={onPressMock} />);
    const heading = getByTestId('gradient-button').props.children;
    fireEvent.press(heading);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('has the correct gradient properties', () => {
    const { getByTestId } = render(<GradientButton text="Click Me" onPress={undefined} />);
    const linearGradient = getByTestId('gradient-button');

    expect(linearGradient.props.colors).toEqual(['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']);
    expect(linearGradient.props.locations).toEqual([0.02, 0.31, 0.67, 0.97]);
    expect(linearGradient.props.start).toEqual([0, 1]);
    expect(linearGradient.props.end).toEqual([1, 0]);
  });

  it('applies correct styles', () => {
    const { getByTestId } = render(<GradientButton text="Click Me" onPress={undefined} />);
    const linearGradient = getByTestId('gradient-button');
    const heading = linearGradient.props.children;

    expect(linearGradient.props.style).toMatchObject({
      borderRadius: 15,
      marginTop: '2%',
      alignSelf: 'center',
      width: '90%',
      height: '6%',
    });

    expect(heading.props.style).toMatchObject({
      color: 'black',
      fontSize: '4%',
      textAlign: 'center',
      lineHeight: '6%',
    });
  });
});