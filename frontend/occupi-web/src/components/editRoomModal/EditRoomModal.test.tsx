import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import EditRoomModal from "./EditRoomModal";
import '@testing-library/jest-dom'

// Mock the props for the EditRoomModal component
const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

// Mock room data to pass as props
const mockRoom = {
    roomId: "RM001",
    roomNo: "101",
    floorNo: "3",
    minOccupancy: 2,
    maxOccupancy: 5,
    description: "A small conference room",
    roomName: "Conference Room A",
    isDisabled: false,
  };

describe("EditRoomModal Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockOnSave.mockClear();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    // Cleanup after each test to ensure a fresh DOM
    cleanup();
  });

  test("can fill in the form inputs and save the room", () => {
    render(
      <EditRoomModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} room={mockRoom} />
    );

    // Simulate input changes
    fireEvent.change(screen.getByLabelText("Room Name"), {
      target: { value: "Conference Room" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "New Room Description" },
    });
    fireEvent.change(screen.getByLabelText("Floor No"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Min Occupancy"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Max Occupancy"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Room No"), {
      target: { value: "101" },
    });

    // Simulate clicking the "Save Changes" button
    fireEvent.click(screen.getByText("Save Changes"));

    // Check if onSave was called with the correct room data
    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnSave.mock.calls[0][0]).toMatchObject({
      roomId: "RM001", // Ensure the roomId is passed
      roomName: "Conference Room",
      description: "New Room Description", // Now includes the correct description
      floorNo: "2",
      minOccupancy: 2, // Ensure it's a number
      maxOccupancy: 5, // Ensure it's a number
      roomNo: "101",
      isDisabled: false, // Should be the default value
    });
  });
  test('calls onClose when clicking the "Cancel" button', () => {
    render(
      <EditRoomModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} room={mockRoom} />
    );

    // Simulate clicking the "Cancel" button
    fireEvent.click(screen.getByText("Cancel"));

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
