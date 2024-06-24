import { render, screen } from '@testing-library/react';
import ColourCircle from './ColourCircle';

test('ColourCircle component renders with correct properties', () => {
  render(<ColourCircle />);
  const circleElement = screen.getByTestId('colour-circle');
  expect(circleElement).toBeTruthy();
});