// import { render, screen, fireEvent } from '@testing-library/react';
// // import '@testing-library/jest-dom/extend-expect'; // Bun's Jest matchers
// import { AddRoomModal } from '@components/index';

// describe('AddRoomModal Integration Test', () => {
//   it('should render modal with input fields and save the room data', () => {
//     const onSaveMock = jest.fn();
//     const onCloseMock = jest.fn();

//     render(<AddRoomModal isOpen={true} onClose={onCloseMock} onSave={onSaveMock} />);

//     // Check if modal header is displayed
//     expect(screen.getByText('Add New Room')).toBeInTheDocument();

//     // Fill out input fields
//     fireEvent.change(screen.getByPlaceholderText('RM000'), { target: { value: 'RM101' } });
//     fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '101' } });
//     fireEvent.change(screen.getByPlaceholderText('3'), { target: { value: '10' } });
//     fireEvent.change(screen.getByLabelText('Min Occupancy'), { target: { value: '5' } });
//     fireEvent.change(screen.getByLabelText('Max Occupancy'), { target: { value: '50' } });
//     fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Conference Room' } });
//     fireEvent.change(screen.getByLabelText('Room Name'), { target: { value: 'Conference A' } });

//     // Simulate save action
//     fireEvent.click(screen.getByText('Add Room'));

//     // Verify save function was called with correct data
//     expect(onSaveMock).toHaveBeenCalledWith({
//       roomId: 'RM101',
//       roomNo: '101',
//       floorNo: '10',
//       minOccupancy: 5,
//       maxOccupancy: 50,
//       description: 'Conference Room',
//       resources: [],
//       roomName: 'Conference A',
//       isDisabled: false,
//     });
//   });

//   it('should close the modal when cancel is clicked', () => {
//     const onCloseMock = jest.fn();
//     const onSaveMock = jest.fn();

//     render(<AddRoomModal isOpen={true} onClose={onCloseMock} onSave={onSaveMock} />);

//     fireEvent.click(screen.getByText('Cancel'));

//     expect(onCloseMock).toHaveBeenCalled();
//   });
// });
