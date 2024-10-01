import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AddRoomModal from "./AddRoomModal";

// Mock the props for the AddRoomModal component
const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

describe("AddRoomModal Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockOnSave.mockClear();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    // Cleanup after each test to ensure a fresh DOM
    cleanup();
  });

  test("renders modal when isOpen is true", () => {
    render(
      <AddRoomModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    // Check if the modal is displayed
    const modalHeader = screen.getByText(/Add New Room/i);
    expect(modalHeader).toBeDefined();
  });

  test("can fill in the form inputs and save the room", () => {
    render(
      <AddRoomModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    // Find input fields and type values
    fireEvent.change(screen.getByPlaceholderText("RM000"), {
      target: { value: "RM101" },
    });
    fireEvent.change(screen.getByPlaceholderText("1"), {
      target: { value: "101" },
    });
    fireEvent.change(screen.getByPlaceholderText("3"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Min Occupancy"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Max Occupancy"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Room Name"), {
      target: { value: "Conference Room" },
    });

    // Simulate clicking the "Add Room" button
    fireEvent.click(screen.getByText("Add Room"));

    // Check if onSave was called with the correct room data
    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnSave.mock.calls[0][0]).toMatchObject({
      roomId: "RM101",
      roomNo: "101",
      floorNo: "2",
      minOccupancy: "2", // Now expect the string '2'
      maxOccupancy: "5", // Now expect the string '5'
      description: "",
      resources: [],
      roomName: "Conference Room",
      isDisabled: false,
    });
  });

  test('calls onClose when clicking the "Cancel" button', () => {
    render(
      <AddRoomModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    // Simulate clicking the "Cancel" button
    fireEvent.click(screen.getByText("Cancel"));

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
