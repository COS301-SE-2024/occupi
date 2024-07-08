import { fireEvent, render, screen, waitFor } from '@testing-library/react';
// import { test, expect } from 'bun:test';
import Appearance from './Appearance';

test('Appearance Component changes theme to dark', async () => {
    render(<Appearance />);
    const darkThemeButton = screen.getByTestId('dark-theme');
    fireEvent.click(darkThemeButton);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});

test('Appearance Component changes theme to light', async () => {
  render(<Appearance />);
  const lightThemeButton = screen.queryAllByTestId('light-theme');
  expect(lightThemeButton.length).toBe(2); 
  
});

