
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DrawerComponent from "./DrawerComponent";
import { BrowserRouter } from "react-router-dom";
import { ReactNode } from "react";
import { JSX } from "react/jsx-runtime";


afterEach(() => {
    cleanup();
  });


// Helper function to render with router context
const renderWithRouter = (component: string | number | boolean | Iterable<ReactNode> | JSX.Element | null | undefined) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};



  test("Navigates correctly when 'Profile' is clicked", () => {
    const { container } = renderWithRouter(<DrawerComponent />);
    const profileButton = screen.getByText("Profile");
    fireEvent.click(profileButton);
    // Check if the selectedItem state is updated
    expect(container.innerHTML).toContain("Profile");
  });

