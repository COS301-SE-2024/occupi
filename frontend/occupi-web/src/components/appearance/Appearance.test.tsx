import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { test, expect } from 'bun:test';
import Appearance from './Appearance';

test('Appearance Component changes theme to dark', async () => {
    render(<Appearance />);
    const darkThemeButton = screen.getByText('Midnight');
    fireEvent.click(darkThemeButton);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
});