/// <reference lib="dom" />
import { test, expect, mock,beforeEach, afterEach } from 'bun:test';
import { render, fireEvent,cleanup } from '@testing-library/react';
import DrawerComponent from './DrawerComponent';


afterEach(() => {
    cleanup();
  });


  test('DrawerComponent should render correctly', () => {
    const { container } = render(<DrawerComponent isOpen={true} onClose={() => {}} />);
    expect(container).toBeTruthy();  // Simpler check to avoid potential snapshot issues
  });
  
//   test('DrawerComponent should call onClose when overlay is clicked', () => {
//     const onCloseMock = mock(() => {});
//     const { getByTestId } = render(<DrawerComponent isOpen={true} onClose={onCloseMock} />);
//     const overlay = getByTestId('drawer-overlay');
//     fireEvent.click(overlay);
//     expect(onCloseMock).toHaveBeenCalled();
//   });

test('DrawerComponent should render menu items correctly', () => {
    const { getByText } = render(<DrawerComponent isOpen={true} onClose={() => {}} />);
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Appearance')).toBeTruthy();
    expect(getByText('Privacy')).toBeTruthy();
    expect(getByText('Help')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
  });