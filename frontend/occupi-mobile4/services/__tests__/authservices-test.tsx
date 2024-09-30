import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as authServices from '../authservices';
import { LoginReq, RegisterReq, VerifyOTPReq } from "@/models/requests";

jest.mock('axios');
jest.mock('expo-secure-store');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('Auth Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    global.fetch = jest.fn();
  });

  describe('login', () => {
    const loginReq: LoginReq = { email: 'test@example.com', password: 'password123' };

    it('should return LoginSuccess on successful login', async () => {
      const mockResponse = { token: 'abc123', user: { id: 1, name: 'Test User' } };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await authServices.login(loginReq);

      expect(result).toEqual(mockResponse);
    });

    it('should return Unsuccessful on login failure', async () => {
      const mockError = {
        error: {
          code: 'INVALID_AUTH',
          details: null,
          message: 'Email does not exist'
        },
        message: 'Invalid email',
        status: 401
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue(mockError)
      });
    
      const result = await authServices.login(loginReq);
      expect(result).toEqual(mockError);
    });

    it('should throw error for network errors', async () => {
      const mockError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(mockError);

      await expect(authServices.login(loginReq)).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    const registerReq: RegisterReq = { email: 'test@example.com', password: 'password123', name: 'Test User' };

    it('should return Success on successful registration', async () => {
      const mockResponse = { data: { message: 'Registration successful' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authServices.register(registerReq);

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on registration failure', async () => {
      const mockError = {
        response: { data: { message: 'Email already exists' } }
      };
      mockedAxios.post.mockRejectedValue(mockError);
    
      await expect(authServices.register(registerReq)).rejects.toEqual(mockError);
    });

    it('should throw error for non-Axios errors', async () => {
      const mockError = new Error('Network error');
      mockedAxios.post.mockRejectedValue(mockError);

      await expect(authServices.register(registerReq)).rejects.toThrow('Network error');
    });

    it('should handle non-axios errors in register', async () => {
      const nonAxiosError = new Error('Non-Axios error');
      mockedAxios.post.mockRejectedValue(nonAxiosError);
    
      await expect(authServices.register(registerReq)).rejects.toThrow('Non-Axios error');
    });
  });

  describe('verifyOtpRegister', () => {
    const verifyOTPReq: VerifyOTPReq = { email: 'test@example.com', otp: '123456' };

    it('should return LoginSuccess on successful OTP verification for registration', async () => {
      const mockResponse = { data: { token: 'abc123', user: { id: 1, name: 'Test User' } } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authServices.verifyOtpRegister(verifyOTPReq);

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on OTP verification failure for registration', async () => {
      const mockError = {
        response: { data: { message: 'Invalid OTP' } }
      };
      mockedAxios.post.mockRejectedValue(mockError);
    
      await expect(authServices.verifyOtpRegister(verifyOTPReq)).rejects.toEqual(mockError);
    });

    it('should throw error for non-Axios errors', async () => {
      const mockError = new Error('Network error');
      mockedAxios.post.mockRejectedValue(mockError);

      await expect(authServices.verifyOtpRegister(verifyOTPReq)).rejects.toThrow('Network error');
    });

    it('should handle non-axios errors in verifyOtpRegister', async () => {
      const nonAxiosError = new Error('Non-Axios error');
      mockedAxios.post.mockRejectedValue(nonAxiosError);
    
      await expect(authServices.verifyOtpRegister(verifyOTPReq)).rejects.toThrow('Non-Axios error');
    });
  });

  describe('verifyOtplogin', () => {
    const verifyOTPReq: VerifyOTPReq = { email: 'test@example.com', otp: '123456' };

    it('should return LoginSuccess on successful OTP verification for login', async () => {
      const mockResponse = { data: { token: 'abc123', user: { id: 1, name: 'Test User' } } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authServices.verifyOtplogin(verifyOTPReq);

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on OTP verification failure for login', async () => {
      const mockError = {
        response: { data: { message: 'Invalid OTP' } }
      };
      mockedAxios.post.mockRejectedValue(mockError);
    
      await expect(authServices.verifyOtplogin(verifyOTPReq)).rejects.toEqual(mockError);
    });

    it('should throw error for non-Axios errors', async () => {
      const mockError = new Error('Network error');
      mockedAxios.post.mockRejectedValue(mockError);

      await expect(authServices.verifyOtplogin(verifyOTPReq)).rejects.toThrow('Network error');
    });

    it('should handle non-axios errors in verifyOtplogin', async () => {
      const nonAxiosError = new Error('Non-Axios error');
      mockedAxios.post.mockRejectedValue(nonAxiosError);
    
      await expect(authServices.verifyOtplogin(verifyOTPReq)).rejects.toThrow('Non-Axios error');
    });
  });

  describe('logout', () => {
    it('should return Success on successful logout', async () => {
      const mockToken = 'abc123';
      const mockResponse = { data: { message: 'Logout successful' } };
      mockedSecureStore.getItemAsync.mockResolvedValue(mockToken);
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authServices.logout();

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on logout failure', async () => {
      const mockError = {
        response: { data: { message: 'Logout failed' } }
      };
      mockedSecureStore.getItemAsync.mockResolvedValue('abc123');
      mockedAxios.post.mockRejectedValue(mockError);
    
      await expect(authServices.logout()).rejects.toEqual(mockError);
    });

    it('should throw error for non-Axios errors', async () => {
      const mockError = new Error('Network error');
      mockedSecureStore.getItemAsync.mockResolvedValue('abc123');
      mockedAxios.post.mockRejectedValue(mockError);

      await expect(authServices.logout()).rejects.toThrow('Network error');
    });

    it('should throw error for non-Axios errors', async () => {
      const mockError = new Error('Network error');
      mockedSecureStore.getItemAsync.mockResolvedValue('abc123');
      mockedAxios.post.mockRejectedValue(mockError);
    
      await expect(authServices.logout()).rejects.toThrow('Network error');
    });

    it('should handle non-axios errors in logout', async () => {
  mockedSecureStore.getItemAsync.mockResolvedValue('some-token');
  const nonAxiosError = new Error('Non-Axios error');
  mockedAxios.post.mockRejectedValue(nonAxiosError);

  await expect(authServices.logout()).rejects.toThrow('Non-Axios error');
});
  });
});