import * as bookingsUtils from '../bookings';
import * as apiServices from '../../services/apiservices';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

jest.mock('../../services/apiservices');
jest.mock('expo-secure-store');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('bookings utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('fetchUserBookings', () => {
    it('should fetch user bookings successfully', async () => {
      const mockEmail = 'test@example.com';
      const mockBookings = [{ id: 1, name: 'Booking 1' }];
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockEmail);
      (apiServices.getUserBookings as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockBookings,
      });

      const result = await bookingsUtils.fetchUserBookings();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('Email');
      expect(apiServices.getUserBookings).toHaveBeenCalledWith({});
      expect(result).toEqual(mockBookings);
    });

    // it('should log response when status is not 200', async () => {
    //   const mockEmail = 'test@example.com';
    //   const mockResponse = { status: 400, data: 'Error' };
    
    //   (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockEmail);
    //   (apiServices.getUserBookings as jest.Mock).mockResolvedValue(mockResponse);
    
    //   const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    //   const result = await bookingsUtils.fetchUserBookings();
    //   expect(consoleLogSpy).toHaveBeenCalledWith('Error Getting Bookings:', mockResponse);
    //   expect(result).toBe('Error');
    
    //   consoleLogSpy.mockRestore(); 
    // });
    

    it('should handle and throw errors', async () => {
      const mockError = new Error('API Error');

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test@example.com');
      (apiServices.getUserBookings as jest.Mock).mockRejectedValue(mockError);

      await expect(bookingsUtils.fetchUserBookings()).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalledWith('Error Getting Bookings:', mockError);
    });
  });


  describe('userBookRoom', () => {
    it('should book a room successfully', async () => {
      const mockRoom = JSON.stringify({
        roomName: 'Room 1',
        date: '2024-08-14',
        floorNo: 1,
        roomId: 'room1',
      });
      const mockEmail = 'test@example.com';
      const mockAttendees = ['user1@example.com', 'user2@example.com'];
      const mockStartTime = '09:00';
      const mockEndTime = '10:00';
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(mockRoom)
        .mockResolvedValueOnce(mockEmail);
      
      (apiServices.bookRoom as jest.Mock).mockResolvedValue({
        status: 200,
        message: 'Successfully booked!',
      });

      const result = await bookingsUtils.userBookRoom(mockAttendees, mockStartTime, mockEndTime);

      expect(console.log).toHaveBeenCalled();
      expect(apiServices.bookRoom).toHaveBeenCalled();
      expect(result).toBe('Successfully booked!');
    });

    it('should handle booking failure', async () => {
      const mockRoom = JSON.stringify({
        roomName: 'Room 1',
        date: '2024-08-14',
        floorNo: 1,
        roomId: 'room1',
      });
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(mockRoom)
        .mockResolvedValueOnce('test@example.com');
      
      (apiServices.bookRoom as jest.Mock).mockResolvedValue({
        status: 400,
        message: 'Booking failed',
      });

      const result = await bookingsUtils.userBookRoom([], '09:00', '10:00');

      expect(result).toBe('Booking failed');
    });

    it('should handle and throw errors', async () => {
      const mockError = new Error('Booking Error');

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('{}')
        .mockResolvedValueOnce('test@example.com');
      
      (apiServices.bookRoom as jest.Mock).mockRejectedValue(mockError);

      await expect(bookingsUtils.userBookRoom([], '09:00', '10:00')).rejects.toThrow('Booking Error');
      expect(console.error).toHaveBeenCalledWith('Error:', mockError);
    });
  });

  describe('userCheckin', () => {
    it('should check in successfully', async () => {
      const mockRoom = JSON.stringify({
        occupiId: 'booking1',
      });
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(mockRoom)
        .mockResolvedValueOnce('test@example.com');
      
      (apiServices.checkin as jest.Mock).mockResolvedValue({
        status: 200,
        message: 'Checked in successfully',
      });

      const result = await bookingsUtils.userCheckin();

      expect(apiServices.checkin).toHaveBeenCalled();
      expect(result).toBe('Checked in successfully');
    });

    it('should handle check-in failure', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('{}')
        .mockResolvedValueOnce('test@example.com');
      
      (apiServices.checkin as jest.Mock).mockResolvedValue({
        status: 400,
        message: 'Check-in failed',
      });

      const result = await bookingsUtils.userCheckin();

      expect(result).toBe('Check-in failed');
    });

    it('should handle and throw errors', async () => {
      const mockError = new Error('Check-in Error');

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('{}')
        .mockResolvedValueOnce('test@example.com');
      
      (apiServices.checkin as jest.Mock).mockRejectedValue(mockError);

      await expect(bookingsUtils.userCheckin()).rejects.toThrow('Check-in Error');
      expect(console.error).toHaveBeenCalledWith('Error:', mockError);
    });
  });

  describe('userCancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const mockRoom = JSON.stringify({
        occupiId: 'booking1',
        emails: ['user1@example.com'],
        roomId: 'room1',
        creator: 'creator@example.com',
        date: '2024-08-14',
        start: '09:00',
        end: '10:00',
        floorNo: 1,
        roomName: 'Room 1',
      });
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(mockRoom)
        .mockResolvedValueOnce('test@example.com');
      
      (apiServices.cancelBooking as jest.Mock).mockResolvedValue({
        status: 200,
        message: 'Booking cancelled successfully',
      });

      const result = await bookingsUtils.userCancelBooking();

      expect(apiServices.cancelBooking).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/home');
      expect(result).toBe('Booking cancelled successfully');
    });

    it('should handle cancellation failure', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('{}')
        .mockResolvedValueOnce('test@example.com');
      
      (apiServices.cancelBooking as jest.Mock).mockResolvedValue({
        status: 400,
        message: 'Cancellation failed',
      });

      const result = await bookingsUtils.userCancelBooking();

      expect(result).toBe('Cancellation failed');
      expect(router.replace).toHaveBeenCalledWith('/login');
    });

    it('should handle and throw errors', async () => {
      const mockError = new Error('Cancellation Error');

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('{}')
        .mockResolvedValueOnce('test@example.com');
      
      (apiServices.cancelBooking as jest.Mock).mockRejectedValue(mockError);

      await expect(bookingsUtils.userCancelBooking()).rejects.toThrow('Cancellation Error');
      expect(console.error).toHaveBeenCalledWith('Error:', mockError);
    });
  });
});