import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import HeaderComponent from "./Header"; // Adjust this import path as necessary
import * as router from 'react-router-dom'; // Import the entire module to manually mock
import * as userStore from 'userStore'; // Import the entire module to manually mock

describe("HeaderComponent", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mock calls before each test

    // Manually mock the useNavigate hook
    jest.spyOn(router, 'useNavigate').mockReturnValue(mockNavigate);

    // Mock the useUser hook with a valid UserDetails object
    jest.spyOn(userStore, 'useUser').mockReturnValue({
      userDetails: {
        name: "John Doe",
        email: "john.doe@example.com",
        dob: "1990-01-01",
        gender: "Male",
        employeeid: "12345",
        number: "555-1234",
        pronouns: "he/him",
        avatarId: "avatar123",
        position: "Software Engineer",
        departmentNo: "Engineering",
      },
      setUserDetails: jest.fn(), // Provide a mock implementation for setUserDetails
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore all mocks after each test
    cleanup(); // Clean up the DOM after each test
  });

  test("renders default greeting and welcome message", () => {
    // Change the useUser return value for this specific test
    jest.spyOn(userStore, 'useUser').mockReturnValue({
      userDetails: null,
      setUserDetails: jest.fn(), // Provide a mock for setUserDetails
    });

    render(<HeaderComponent />);

    // Check if the default greeting, welcome message, and action text are rendered
    expect(screen.getByText("Hi Guest 👋")).toBeDefined();
    expect(screen.getByText("Welcome to Occupi")).toBeDefined();
    expect(screen.getByText("This Weeks Capacity Predictions")).toBeDefined();
  });

  test("renders the user's name if available", () => {
    // Mock useUser to return a user with all required fields
    jest.spyOn(userStore, 'useUser').mockReturnValue({
      userDetails: {
        name: "John Doe",
        email: "john.doe@example.com",
        dob: "1990-01-01",
        gender: "Male",
        employeeid: "12345",
        number: "555-1234",
        pronouns: "he/him",
        avatarId: "avatar123",
        position: "Software Engineer",
        departmentNo: "Engineering",
      },
      setUserDetails: jest.fn(), // Provide a mock for setUserDetails
    });

    render(<HeaderComponent />);

    // Check if the greeting includes the user's name
    expect(screen.getByText("Hi John Doe 👋")).toBeDefined();
    expect(screen.getByText("Welcome to Occupi")).toBeDefined();
    expect(screen.getByText("This Weeks Capacity Predictions")).toBeDefined();
  });

  test("navigates to AI dashboard when action text is clicked", () => {
    // Mock useUser to return a user with all required fields
    jest.spyOn(userStore, 'useUser').mockReturnValue({
      userDetails: {
        name: "John Doe",
        email: "john.doe@example.com",
        dob: "1990-01-01",
        gender: "Male",
        employeeid: "12345",
        number: "555-1234",
        pronouns: "he/him",
        avatarId: "avatar123",
        position: "Software Engineer",
        departmentNo: "Engineering",
      },
      setUserDetails: jest.fn(), // Provide a mock for setUserDetails
    });

    render(<HeaderComponent />);

    // Simulate clicking the motion component with action text
    const actionTextElement = screen.getByText("This Weeks Capacity Predictions");
    fireEvent.click(actionTextElement);

    // Ensure that navigate is called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/ai-dashboard");
  });
});
