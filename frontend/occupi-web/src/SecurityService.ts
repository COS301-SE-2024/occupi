import axios from 'axios';

export interface SecuritySettings {
  useBiometrics: boolean;
  use2FA: boolean;
  forceLogoutOnAppClose: boolean;
}

export const getSecuritySettings = async (email: string): Promise<{ data: SecuritySettings }> => {
  try {
    const response = await axios.get('/api/get-security-settings', {
      params: {
        email,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching security settings:', error);
    throw error;
  }
};

export const updateSecuritySettings = async (data: {
    email: string;
    mfa: 'on' | 'off';
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
  }): Promise<{ data: null }> => {
    try {
      const response = await axios.post('/api/update-security-settings', data);
      return response.data;
    } catch (error) {
      console.error('Error updating security settings:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
        }
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  };