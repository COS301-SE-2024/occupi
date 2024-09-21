import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as apiServices from '../apiservices';
import { storeUserData } from "../securestore";

jest.mock('axios');
jest.mock('expo-secure-store');
jest.mock('../securestore');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('API Services', () => {
  const mockEmail = 'test@example.com';
  const mockAuthToken = 'mockAuthToken';
  const mockSuccessResponse = { data: {}, status: 'success', message: 'Operation successful' };
  const mockErrorResponse = {
    data: null,
    status: 'error',
    message: 'An unexpected error occurred',
    error: {
      code: 'UNKNOWN_ERROR',
      details: 'An unexpected error occurred',
      message: 'An unexpected error occurred'
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockedSecureStore.getItemAsync.mockResolvedValue(mockAuthToken);
  });

  describe('getUserDetails', () => {
    it('should return success response when API call is successful', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.getUserDetails(mockEmail, mockAuthToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/user-details",
        expect.objectContaining({
          params: { email: mockEmail },
          headers: { Authorization: mockAuthToken },
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.get.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.getUserDetails(mockEmail, mockAuthToken);

      expect(result).toEqual(mockErrorResponse);
    });

    it('should handle non-Axios errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await apiServices.getUserDetails(mockEmail, mockAuthToken);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('getNotificationSettings', () => {
    it('should return success response when API call is successful', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.getNotificationSettings(mockEmail);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/get-notification-settings",
        expect.objectContaining({
          params: { email: mockEmail },
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.get.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.getNotificationSettings(mockEmail);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('getUserBookings', () => {
    it('should return success response when API call is successful', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.getUserBookings(mockEmail);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://dev.occupi.tech/api/view-bookings?filter={"email":"${mockEmail}"}`,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.get.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.getUserBookings(mockEmail);

      expect(result).toEqual(mockErrorResponse);
    });

    it('should handle case when auth token is not found', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await apiServices.getUserBookings(mockEmail);

      expect(result).toEqual(expect.objectContaining({
        status: 'error',
        message: 'Authentication failed',
      }));
    });
  });


  describe('updateUserDetails', () => {
    const mockUpdateReq = { email: mockEmail, name: 'Test User' };

    it('should return success response when API call is successful', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.updateUserDetails(mockUpdateReq);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/update-user",
        mockUpdateReq,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(storeUserData).toHaveBeenCalledWith(JSON.stringify(mockUpdateReq));
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.post.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.updateUserDetails(mockUpdateReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });

describe('getNotifications', () => {
    const mockNotificationsReq = { email: mockEmail, page: 1, limit: 10 };

    it('should return success response when API call is successful', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.getNotifications(mockNotificationsReq);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/get-notifications",
        expect.objectContaining({
          params: mockNotificationsReq,
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.get.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.getNotifications(mockNotificationsReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('checkin', () => {
    const mockCheckInReq = { email: mockEmail, bookingId: '12345' };

    it('should return success response when API call is successful', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.checkin(mockCheckInReq);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/check-in",
        mockCheckInReq,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.post.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.checkin(mockCheckInReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('bookRoom', () => {
    const mockBookRoomReq = { email: mockEmail, roomId: '12345', startTime: '2023-08-15T10:00:00', endTime: '2023-08-15T11:00:00' };

    it('should return success response when API call is successful', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.bookRoom(mockBookRoomReq);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/book-room",
        mockBookRoomReq,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.post.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.bookRoom(mockBookRoomReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('cancelBooking', () => {
    const mockCancelBookingReq = { email: mockEmail, bookingId: '12345' };

    it('should return success response when API call is successful', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.cancelBooking(mockCancelBookingReq);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/cancel-booking",
        mockCancelBookingReq,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.post.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.cancelBooking(mockCancelBookingReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('getSecuritySettings', () => {
    it('should return success response when API call is successful', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.getSecuritySettings(mockEmail);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/get-security-settings",
        expect.objectContaining({
          params: { email: mockEmail },
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.get.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.getSecuritySettings(mockEmail);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('updateSecuritySettings', () => {
    const mockSecuritySettingsReq = { email: mockEmail, twoFactor: true };

    it('should return success response when API call is successful', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.updateSecuritySettings(mockSecuritySettingsReq);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/update-security-settings",
        mockSecuritySettingsReq,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.post.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.updateSecuritySettings(mockSecuritySettingsReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('updateNotificationSettings', () => {
    const mockNotificationSettingsReq = { email: mockEmail, invites: 'on', bookingReminder: 'off' };

    it('should return success response when API call is successful', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSuccessResponse });

      const result = await apiServices.updateNotificationSettings(mockNotificationSettingsReq);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/update-notification-settings",
        expect.objectContaining({
          params: { req: mockNotificationSettingsReq },
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return error response when API call fails', async () => {
      mockedAxios.get.mockRejectedValue({ response: { data: mockErrorResponse } });

      const result = await apiServices.updateNotificationSettings(mockNotificationSettingsReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });
});