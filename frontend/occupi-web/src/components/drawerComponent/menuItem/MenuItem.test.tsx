import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MenuItem from './MenuItem'; // Adjust the path based on your structure
import { FaUser } from 'react-icons/fa'; // Example icon, replace with your actual icons

describe('MenuItem', () => {
  const mockHandleClick = jest.fn();

  beforeEach(() => {
    mockHandleClick.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders MenuItem with the correct text and icon', () => {
    render(
      <MenuItem
        icon={<FaUser />}
        text="Profile"
        path="/profile"
        selectedItem="/profile"
        handleClick={mockHandleClick}
      />
    );

    // Check if the icon and text are rendered
    expect(screen.getByText(/Profile/i)).toBeDefined();
  });

  test('applies selected style when selectedItem matches path', () => {
    const { container } = render(
      <MenuItem
        icon={<FaUser />}
        text="Profile"
        path="/profile"
        selectedItem="/profile"
        handleClick={mockHandleClick}
      />
    );

    // Check if the selected styling is applied
    const menuItem = container.firstChild as HTMLElement;
    expect(menuItem.classList.contains('bg-secondary')).toBe(true);
  });

  test('does not apply selected style when selectedItem does not match path', () => {
    const { container } = render(
      <MenuItem
        icon={<FaUser />}
        text="Appearance"
        path="/appearance"
        selectedItem="/profile"
        handleClick={mockHandleClick}
      />
    );

    // Ensure that the background color class is not applied when not selected
    const menuItem = container.firstChild as HTMLElement;
    expect(menuItem.classList.contains('bg-secondary')).toBe(false);
  });

  test('calls handleClick with correct path when clicked', () => {
    render(
      <MenuItem
        icon={<FaUser />}
        text="Profile"
        path="/profile"
        selectedItem="/appearance"
        handleClick={mockHandleClick}
      />
    );

    // Simulate clicking the menu item
    const menuItem = screen.getByText(/Profile/i);
    fireEvent.click(menuItem);

    // Ensure handleClick is called with the correct path
    expect(mockHandleClick).toHaveBeenCalledWith('/profile');
  });
});
