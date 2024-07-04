/// <reference lib="dom" />
import { afterEach, test, expect, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TabComponent } from "@components/index";

afterEach(() => {
  cleanup();
});

test("Tab component renders correctly", () => {
    render(<TabComponent setSelectedTab={function (): void {
        throw new Error("Function not implemented.");
    } } />);
 const tab = screen.getByTestId('tab');
    expect(tab).not.toBeNull();

});

test("Tab component renders all three tabs", () => {
    const mockSetSelectedTab = mock(() => {});
    render(<TabComponent setSelectedTab={mockSetSelectedTab} />);
    
    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Bookings')).toBeDefined();
    expect(screen.getByText('Visitations')).toBeDefined();
  });

  test("Initial active tab is Overview", () => {
    const mockSetSelectedTab = mock(() => {});
    render(<TabComponent setSelectedTab={mockSetSelectedTab} />);
    
    const overviewTab = screen.getByText('Overview').closest('div');
    expect(overviewTab?.classList.contains('bg-primary')).toBe(true);
  });

  test("Clicking on a tab changes the active tab", () => {
    const mockSetSelectedTab = mock(() => {});
    render(<TabComponent setSelectedTab={mockSetSelectedTab} />);
    
    const bookingsTab = screen.getByText('Bookings');
    fireEvent.click(bookingsTab);
    
    const bookingsTabDiv = bookingsTab.closest('div');
    expect(bookingsTabDiv?.classList.contains('bg-primary')).toBe(true);
  });
  
  test("Clicking on a tab calls setSelectedTab with correct argument", () => {
    const mockSetSelectedTab = mock((arg: string) => {arg.toLowerCase()});
    render(<TabComponent setSelectedTab={mockSetSelectedTab} />);
    
    const bookingsTab = screen.getByText('Bookings');
    fireEvent.click(bookingsTab);
    
    expect(mockSetSelectedTab.mock.calls.length).toBe(1);
    expect(mockSetSelectedTab.mock.calls[0][0]).toBe('/bookings');
  });