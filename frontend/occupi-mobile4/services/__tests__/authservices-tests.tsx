import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { login, logout } from '../../services/authservices'; 
import { LoginReq } from '@/models/requests';
import { LoginSuccess, Unsuccessful, Success } from '@/models/response';

jest.mock('axios');
jest.mock('expo-secure-store');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('authservice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSecureStore.getItemAsync.mockResolvedValue('mock-token');
  });

  describe('login', () => {
    const loginReq: LoginReq = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return LoginSuccess on successful login', async () => {
      const mockResponse: LoginSuccess = {
        data: { token: 'mock-token' },
        message: 'Login successful',
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await login(loginReq);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://dev.occupi.tech/auth/login-mobile',
        loginReq,
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed login', async () => {
      const mockError: Unsuccessful = {
        data: null,
        status: 'error',
        message: 'Invalid credentials',
        error: {
          code: 'AUTH_ERROR',
          details: 'Invalid email or password',
          message: 'Authentication failed',
        }
      };
    
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: mockError }
      });
    
      await expect(login(loginReq)).rejects.toEqual(
        expect.objectContaining({
          isAxiosError: true,
          response: { data: mockError }
        })
      );
    });

    it('should throw error on network failure', async () => {
      const networkError = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(login(loginReq)).rejects.toThrow('Network error');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      mockedSecureStore.getItemAsync.mockResolvedValue('mock-token');
    });

    it('should return Success on successful logout', async () => {
      const mockResponse: Success = {
        status: 200,
        message: 'Logout successful',
        data: null,
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await logout();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://dev.occupi.tech/auth/logout',
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'mock-token',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed logout', async () => {
      const mockError: Unsuccessful = {
        data: null,
        status: 'error',
        message: 'Logout failed',
        error: {
          code: 'LOGOUT_ERROR',
          details: 'Unable to logout',
          message: 'Logout operation failed',
        }
      };
    
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: mockError }
      });
    
      await expect(logout()).rejects.toEqual(
        expect.objectContaining({
          isAxiosError: true,
          response: { data: mockError }
        })
      );
    });

    it('should throw error on network failure', async () => {
      const networkError = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(logout()).rejects.toThrow('Network error');
    });
  });
});