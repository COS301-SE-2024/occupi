import * as bookingsUtils from '../bookings';
import * as apiServices from '../../services/apiservices';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import * as notifications from '../notifications';


jest.mock('../../services/apiservices');
jest.mock('expo-secure-store');
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('../notifications');

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
      expect(apiServices.getUserBookings).toHaveBeenCalledWith(mockEmail);
      expect(result).toEqual(mockBookings);
    });

    it('should log response when status is not 200', async () => {
      const mockEmail = 'test@example.com';
      const mockResponse = { status: 400, data: 'Error' };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockEmail);
      (apiServices.getUserBookings as jest.Mock).mockResolvedValue(mockResponse);

      const result = await bookingsUtils.fetchUserBookings();

      expect(console.log).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual('Error');
    });

    it('should handle and throw errors', async () => {
      const mockError = new Error('API Error');

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test@example.com');
      (apiServices.getUserBookings as jest.Mock).mockRejectedValue(mockError);

      await expect(bookingsUtils.fetchUserBookings()).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalledWith('Error:', mockError);
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
        message: 'Room booked successfully',
      });

      const result = await bookingsUtils.userBookRoom(mockAttendees, mockStartTime, mockEndTime);

      expect(console.log).toHaveBeenCalled(); // Check if console.log was called
      expect(apiServices.bookRoom).toHaveBeenCalled();
      expect(result).toBe('Room booked successfully');
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


    it('should handle empty push tokens', async () => {
      const mockBookingInfo = JSON.stringify({
        roomName: 'Room 1',
        date: '2024-08-22',
        floorNo: '1',
        roomId: '123'
      });
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(mockBookingInfo)
        .mockResolvedValueOnce('user@example.com');
      
      const mockBookResponse = { status: 'success', message: 'Room booked successfully' };
      (apiServices.bookRoom as jest.Mock).mockResolvedValue(mockBookResponse);
      
      const mockPushTokens = { data: null };
      (apiServices.getExpoPushTokens as jest.Mock).mockResolvedValue(mockPushTokens);
      
      const result = await bookingsUtils.userBookRoom(['attendee1@example.com'], '09:00', '10:00');
      
      expect(result).toBe('Room booked successfully');
      expect(apiServices.getExpoPushTokens).toHaveBeenCalledWith(['attendee1@example.com']);
      expect(notifications.sendPushNotification).toHaveBeenCalledWith(
        [],
        'Meeting Invite',
        'user@example.com has invited you to a meeting in Room 1 on 2024-08-22'
      );
    });

    it('should return default message when booking fails without a specific message', async () => {
      const mockBookingInfo = JSON.stringify({
        roomName: 'Room 1',
        date: '2024-08-22',
        floorNo: '1',
        roomId: '123'
      });
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(mockBookingInfo)
        .mockResolvedValueOnce('user@example.com');
      
      const mockBookResponse = { status: 'failure' };
      (apiServices.bookRoom as jest.Mock).mockResolvedValue(mockBookResponse);
      
      const result = await bookingsUtils.userBookRoom(['attendee1@example.com'], '09:00', '10:00');
      
      expect(result).toBe('Booking failed');
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
      expect(router.replace).not.toHaveBeenCalled();
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

  describe('fetchRooms', () => {
    it('should fetch rooms with floor number', async () => {
      const mockResponse = { status: 200, data: [{ id: 1, name: 'Room 1' }] };
      (apiServices.getRooms as jest.Mock).mockResolvedValue(mockResponse);

      const result = await bookingsUtils.fetchRooms('1', '');
      expect(result).toEqual(mockResponse.data);
      expect(apiServices.getRooms).toHaveBeenCalledWith({
        operator: 'eq',
        filter: { floorNo: '1' }
      });
    });

    it('should fetch rooms with room name', async () => {
      const mockResponse = { status: 200, data: [{ id: 1, name: 'Room 1' }] };
      (apiServices.getRooms as jest.Mock).mockResolvedValue(mockResponse);

      const result = await bookingsUtils.fetchRooms('', 'Room 1');
      expect(result).toEqual(mockResponse.data);
      expect(apiServices.getRooms).toHaveBeenCalledWith({
        operator: 'eq',
        filter: { roomName: 'Room 1' }
      });
    });

    it('should fetch rooms with default floor 0 when no parameters are provided', async () => {
      const mockResponse = { status: 200, data: [{ id: 1, name: 'Room 1' }] };
      (apiServices.getRooms as jest.Mock).mockResolvedValue(mockResponse);

      const result = await bookingsUtils.fetchRooms('', '');
      expect(result).toEqual(mockResponse.data);
      expect(apiServices.getRooms).toHaveBeenCalledWith({
        operator: 'eq',
        filter: { floorNo: '0' }
      });
    });

    it('should handle non-200 status', async () => {
      const mockResponse = { status: 400, data: 'Error message' };
      (apiServices.getRooms as jest.Mock).mockResolvedValue(mockResponse);
      console.log = jest.fn();

      const result = await bookingsUtils.fetchRooms('', '');
      expect(console.log).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual('Error message');
    });

    it('should handle and throw errors', async () => {
      const error = new Error('Network error');
      (apiServices.getRooms as jest.Mock).mockRejectedValue(error);

      await expect(bookingsUtils.fetchRooms('', '')).rejects.toThrow('Network error');
    });
  });

  describe('userBookRoom', () => {
    it('should book a room and send push notifications', async () => {
      const mockBookingInfo = JSON.stringify({
        roomName: 'Room 1',
        date: '2024-08-22',
        floorNo: '1',
        roomId: '123'
      });
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(mockBookingInfo)
        .mockResolvedValueOnce('user@example.com');
      
      const mockBookResponse = { status: 'success', message: 'Room booked successfully' };
      (apiServices.bookRoom as jest.Mock).mockResolvedValue(mockBookResponse);
      
      const mockPushTokens = { data: ['token1', 'token2'] };
      (apiServices.getExpoPushTokens as jest.Mock).mockResolvedValue(mockPushTokens);
      
      const result = await bookingsUtils.userBookRoom(['attendee1@example.com'], '09:00', '10:00');
      
      expect(result).toBe('Room booked successfully');
      expect(apiServices.bookRoom).toHaveBeenCalled();
      expect(apiServices.getExpoPushTokens).toHaveBeenCalledWith(['attendee1@example.com']);
      expect(notifications.sendPushNotification).toHaveBeenCalledWith(
        ['token1', 'token2'],
        'Meeting Invite',
        'user@example.com has invited you to a meeting in Room 1 on 2024-08-22'
      );
    });
  });
});