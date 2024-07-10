// // src/services/AuthService.ts
// import axios, { AxiosResponse } from 'axios';

// const API_URL = import.meta.env.VITE_API_URL;
// console.log(API_URL);

// if (!API_URL) {
//   throw new Error('VITE_API_URL is not defined in the environment');
// }

// // ... rest of the AuthService code remains the same
// // ... rest of the AuthService code remains the same
// interface RegisterData {
//   email: string;
//   password: string;
//   employee_id?: string;
// }

// interface LoginData {
//   email: string;
//   password: string;
// }

// interface VerifyOTPData {
//   email: string;
//   oTP: string;
// }

// interface ApiResponse {
//   status: number;
//   message: string;
//   data: any;
// }

// const AuthService = {
//   register: async (data: RegisterData): Promise<ApiResponse> => {
//     try {
//       const response: AxiosResponse<ApiResponse> = await axios.post(`${API_URL}/auth/register`, data);
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         throw error.response.data;
//       }
//       throw new Error('An unexpected error occurred');
//     }
//   },

//   login: async (data: LoginData): Promise<ApiResponse> => {
//     try {
//       const response: AxiosResponse<ApiResponse> = await axios.post(`${API_URL}/auth/login`, data);
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         throw error.response.data;
//       }
//       throw new Error('An unexpected error occurred');
//     }
//   },

//   verifyOTP: async (data: VerifyOTPData): Promise<ApiResponse> => {
//     try {
//       const response: AxiosResponse<ApiResponse> = await axios.post(`${API_URL}/auth/verify-otp`, data);
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         throw error.response.data;
//       }
//       throw new Error('An unexpected error occurred');
//     }
//   }
// };

// export default AuthService;


import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        // employee_id
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  // We'll add login and verifyOTP methods later
};

export default AuthService;