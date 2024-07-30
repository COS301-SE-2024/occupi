import { fetchUserBookings, userCheckin, userCancelBooking } from '../bookings';
import { getUserBookings, checkin, cancelBooking } from '../../services/apiservices';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('../../services/apiservices');
jest.mock('expo-secure-store');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('../bookings.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserBookings', () => {
    it('should fetch user bookings successfully', async () => {
      const mockEmail = 'test@example.com';
      const mockBookings = [{ id: 1, title: 'Booking 1' }, { id: 2, title: 'Booking 2' }];
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockEmail);
      (getUserBookings as jest.Mock).mockResolvedValue({ status: 200, data: mockBookings });

      const result = await fetchUserBookings();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('Email');
      expect(getUserBookings).toHaveBeenCalledWith(mockEmail);
      expect(result).toEqual(mockBookings);
    });

    it('should handle errors when fetching user bookings', async () => {
      const mockError = new Error('API Error');
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test@example.com');
      (getUserBookings as jest.Mock).mockRejectedValue(mockError);

      await expect(fetchUserBookings()).rejects.toThrow('API Error');
    });
  });

  describe('userCheckin', () => {
    it('should perform user check-in successfully', async () => {
      const mockRoom = { occupiId: 'room123' };
      const mockEmail = 'test@example.com';
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockRoom))
        .mockResolvedValueOnce(mockEmail);
      (checkin as jest.Mock).mockResolvedValue({ status: 200, message: 'Check-in successful' });

      const result = await userCheckin();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('CurrentRoom');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('Email');
      expect(checkin).toHaveBeenCalledWith({ email: mockEmail, bookingId: 'room123' });
      expect(result).toBe('Check-in successful');
    });

    it('should handle errors during user check-in', async () => {
      const mockError = new Error('Check-in Error');
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('{}');
      (checkin as jest.Mock).mockRejectedValue(mockError);

      await expect(userCheckin()).rejects.toThrow('Check-in Error');
    });
  });

  describe('userCancelBooking', () => {
    it('should cancel user booking successfully', async () => {
      const mockRoom = {
        occupiId: 'booking123',
        emails: ['user1@example.com', 'user2@example.com'],
        roomId: 'room123',
        creator: 'user1@example.com',
        date: '2023-07-30',
        start: '10:00',
        end: '11:00',
        floorNo: 1,
        roomName: 'Meeting Room A'
      };
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockRoom));
      (cancelBooking as jest.Mock).mockResolvedValue({ status: 200, message: 'Booking cancelled successfully' });

      const result = await userCancelBooking();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('CurrentRoom');
      expect(cancelBooking).toHaveBeenCalledWith(expect.objectContaining({
        bookingId: 'booking123',
        emails: ['user1@example.com', 'user2@example.com'],
        roomId: 'room123',
        creator: 'user1@example.com',
        date: '2023-07-30',
        start: '10:00',
        end: '11:00',
        floorNo: 1,
        roomName: 'Meeting Room A'
      }));
      expect(router.replace).toHaveBeenCalledWith('/home');
      expect(result).toBe('Booking cancelled successfully');
    });

    it('should handle errors during booking cancellation', async () => {
      const mockError = new Error('Cancellation Error');
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('{}');
      (cancelBooking as jest.Mock).mockRejectedValue(mockError);

      await expect(userCancelBooking()).rejects.toThrow('Cancellation Error');
    });
  });
});