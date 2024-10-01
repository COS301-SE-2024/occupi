// // src/DrawerComponent.test.tsx
// import { render, screen, fireEvent } from '@testing-library/react';
// import DrawerComponent from './DrawerComponent';
// import { useNavigate } from 'react-router-dom';
// import { Appearance } from '@components/index'; // Mock the Appearance component
// import { SettingsImg } from '@assets/index'; // Mock the image

// // Mock useNavigate from react-router-dom
// jest.mock('react-router-dom', () => ({
//   useNavigate: jest.fn(),
// }));

// // Mock the assets
// jest.mock('@assets/index', () => ({
//   SettingsImg: 'settings-image-mock',
//   Userprofile: () => <div>UserProfile Icon</div>,
//   Pallete: () => <div>Pallete Icon</div>,
// }));

// // Mock Appearance component
// jest.mock('@components/index', () => ({
//   Appearance: jest.fn(() => <div data-testid="appearance-component">Appearance Component</div>),
// }));

// describe('DrawerComponent', () => {
//   const mockNavigate = jest.fn();

//   beforeEach(() => {
//     // Mock useNavigate
//     (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
//   });

//   afterEach(() => {
//     jest.clearAllMocks(); // Reset mock functions after each test
//   });

//   test('renders the drawer with default settings text and image', () => {
//     render(<DrawerComponent />);

//     // Check if default message is displayed
//     expect(screen.getByText(/Please Select a Setting/i)).toBeDefined();
    
//     // Check if the default image is rendered
//     const settingsImage = screen.getByAltText('Settings');
//     expect(settingsImage).toHaveAttribute('src', 'settings-image-mock');
//   });

//   test('renders MenuItems and navigates when clicked', () => {
//     render(<DrawerComponent />);

//     // Check for the presence of Profile and Appearance menu items
//     expect(screen.getByText(/Profile/i)).toBeDefined();
//     expect(screen.getByText(/Appearance/i)).toBeDefined();

//     // Simulate clicking the "Profile" menu item
//     fireEvent.click(screen.getByText(/Profile/i));
    
//     // Expect navigation to be called with correct path
//     expect(mockNavigate).toHaveBeenCalledWith('/settings/profile');
//   });

//   test('renders Appearance component when showAppearance is true', () => {
//     render(<DrawerComponent />);

//     // Since showAppearance is set to false, Appearance component should not be in the DOM initially
//     expect(screen.queryByTestId('appearance-component')).not.toBeDefined();

//   });
// });
