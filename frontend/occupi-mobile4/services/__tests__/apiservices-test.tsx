import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import {
  getUserDetails,
  getNotificationSettings,
  getUserBookings,
  getSecuritySettings,
  updateSecuritySettings,
  updateNotificationSettings,
} from "../apiservices";
import { NotificationSettingsReq } from '@/models/requests';

jest.mock('axios');
jest.mock("expo-secure-store");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("User API Functions", () => {
  const mockEmail = "test@example.com";
  const mockAuthToken = "mockAuthToken";
  const mockSuccessResponse = { success: true, data: {} };
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
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockAuthToken);
    mockedAxios.isAxiosError.mockImplementation((payload: any) => true);
  });

  describe("getUserDetails", () => {
    it("should return success response when API call is successful", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSuccessResponse });

      const result = await getUserDetails(mockEmail, mockAuthToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/user-details",
        expect.objectContaining({
          params: { email: mockEmail },
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it("should return error response when API call fails", async () => {
      mockedAxios.get.mockRejectedValue({
        response: { data: mockErrorResponse },
      });

      const result = await getUserDetails(mockEmail, mockAuthToken);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe("getNotificationSettings", () => {
    it("should return success response when API call is successful", async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockSuccessResponse });

      const result = await getNotificationSettings(mockEmail);

      expect(axios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/get-notification-settings",
        expect.objectContaining({
          params: { email: mockEmail },
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it("should return error response when API call fails", async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        response: { data: mockErrorResponse },
      });

      const result = await getNotificationSettings(mockEmail);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe("getUserBookings", () => {
    it("should return success response when API call is successful", async () => {
      const mockAuthToken = "mockAuthToken";
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockAuthToken);
      (axios.get as jest.Mock).mockResolvedValue({ data: { success: true, bookings: [] } });
  
      const result = await getUserBookings(mockEmail);
  
      expect(axios.get).toHaveBeenCalledWith(
        `https://dev.occupi.tech/api/view-bookings?filter={"email":"${mockEmail}"}`,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual({ success: true, bookings: [] });
    });
  
    it("should return error response when API call fails", async () => {
      const mockAuthToken = "mockAuthToken";
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockAuthToken);
      (axios.get as jest.Mock).mockRejectedValue({
        response: { data: { success: false, message: "Error" } },
      });
  
      const result = await getUserBookings(mockEmail);
  
      expect(result).toEqual({ success: false, message: "Error" });
    });
  
    it("should handle case when auth token is not found", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  
      const result = await getUserBookings(mockEmail);
  
      expect(result).toEqual({ success: false, message: "Authentication failed" });
    });
  });

  describe("getSecuritySettings", () => {
    it("should return success response when API call is successful", async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockSuccessResponse });

      const result = await getSecuritySettings(mockEmail);

      expect(axios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/get-security-settings",
        expect.objectContaining({
          params: { email: mockEmail },
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );

      expect(result).toEqual(mockSuccessResponse);
    });

    it("should return error response when API call fails", async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        response: { data: mockErrorResponse },
      });

      const result = await getSecuritySettings(mockEmail);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe("updateSecuritySettings", () => {
    it("should return success response when API call is successful", async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: mockSuccessResponse,
      });
      const mockReq = { email: mockEmail, newSetting: "value" };

      const result = await updateSecuritySettings(mockReq);

      expect(axios.post).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/update-security-settings",
        mockReq,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it("should return error response when API call fails", async () => {
      (axios.post as jest.Mock).mockRejectedValue({
        response: { data: mockErrorResponse },
      });
      const mockReq = { email: mockEmail, newSetting: "value" };

      const result = await updateSecuritySettings(mockReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe("updateNotificationSettings", () => {
    it("should return success response when API call is successful", async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockSuccessResponse });
      const mockReq: NotificationSettingsReq = {
        email: mockEmail,
        invites: "on",
        bookingReminder: "on",
      };

      const result = await updateNotificationSettings(mockReq);

      expect(axios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/update-notification-settings",
        expect.objectContaining({
          params: { req: mockReq },
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it("should return error response when API call fails", async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        response: { data: mockErrorResponse },
      });
      const mockReq: NotificationSettingsReq = {
        email: mockEmail,
        invites: "on",
        bookingReminder: "on",
      };

      const result = await updateNotificationSettings(mockReq);

      expect(result).toEqual(mockErrorResponse);
    });
  });
});
