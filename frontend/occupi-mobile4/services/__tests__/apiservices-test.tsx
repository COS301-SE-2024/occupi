import axios from "axios";
import * as SecureStore from "expo-secure-store";
import {
  getUserDetails,
  getNotificationSettings,
  getUserBookings,
  getSecuritySettings,
  updateSecuritySettings,
  updateNotificationSettings,
} from "../apiservices";
import { NotificationSettingsReq } from "@/models/requests";

jest.mock("axios");
jest.mock("expo-secure-store");

jest.mock('axios', () => {
  const originalAxios = jest.requireActual('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn((url, config) => {
        console.log(`Mocked GET call to URL: ${url} with config:`, config);
        if (url.includes('view-bookings')) {
          return Promise.resolve({ data: { success: true, bookings: [] } });
        }
        return Promise.reject({ response: { data: { message: 'URL not matched in mock' } } });
      }),
      post: jest.fn(),
      isAxiosError: originalAxios.isAxiosError,
    },
  };
});

describe("User API Functions", () => {
  const mockEmail = "test@example.com";
  const mockAuthToken = "mockAuthToken";
  const mockSuccessResponse = { success: true, data: {} };
  const mockErrorResponse = { success: false, message: "Error" };

  beforeEach(() => {
    jest.resetAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockAuthToken);
  });

  describe("getUserDetails", () => {
    it("should return success response when API call is successful", async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockSuccessResponse });

      const result = await getUserDetails(mockEmail, mockAuthToken);

      expect(axios.get).toHaveBeenCalledWith(
        "https://dev.occupi.tech/api/user-details",
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
      (axios.get as jest.Mock).mockResolvedValue({ data: mockSuccessResponse });
      const result = await getUserBookings(mockEmail);
      expect(axios.get).toHaveBeenCalledWith(
        `https://dev.occupi.tech/api/view-bookings?filter={"email":"${mockEmail}"}`,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: mockAuthToken }),
        })
      );
      expect(result).toEqual(mockSuccessResponse);
    });
  
    it("should return error response when API call fails", async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        response: { data: mockErrorResponse },
      });
      const result = await getUserBookings(mockEmail);
      expect(result).toEqual(mockErrorResponse);
    });
  
    it("should handle case when auth token is not found", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const result = await getUserBookings(mockEmail);
      expect(result).toEqual({ success: false, message: "An unexpected error occurred" });
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
