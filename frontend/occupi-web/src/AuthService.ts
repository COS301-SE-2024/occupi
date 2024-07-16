import axios from 'axios';

const API_URL = '/auth'; // This will be proxied to https://dev.occupi.tech
const API_USER_URL = '/api'; // Adjust this if needed

const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred');
    }
  },



  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/logout`, {
        
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred Whilst Logging out');
    }
  },

  getUserDetails : async (email: string) => {
    try {
      console.log(API_USER_URL);
      const response = await axios.get(`${API_USER_URL}/user-details?email=${encodeURIComponent(email)}`, {
        headers: {
          Accept: "application/json",
        },
      });
      console.log("Full user details response:", response);
      if (response.status === 200) {
        return response.data.data; // The user details are in the 'data' field
      } else {
        throw new Error(response.data.message || 'Failed to get user details');
      }
    } catch (error) {
      console.error("Error in getUserDetails:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get user details');
      }
      throw new Error('An unexpected error occurred while fetching user details');
    }
  },
  
 


  verifyOtpLogin: async (email: string, otp: string) => {
    try {
      console.log("Verifying OTP:", email,otp);
      const response = await axios.post(`${API_URL}/verify-otp-login`, { email, otp });
      if (response.data.status === 200) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error("Error in verifyOtpLogin:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred during OTP verification');
    }
  }



};

export default AuthService;