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
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  webauthnRegister: async (email: string) => {
    try {
      const response = await axios.post(`${API_URL}/register-admin-begin`, {
        email,
      });

      if (response.data.message === "Please check your email for an otp."){
        return response.data;
      }
      
      response.data.data.options.publicKey.challenge = bufferDecode(response.data.data.options.publicKey.challenge);
      response.data.data.options.publicKey.user.id = bufferDecode(response.data.data.options.publicKey.user.id);

      const credential: any = await navigator.credentials.create({ publicKey: response.data.data.options.publicKey });

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const credentialJSON = JSON.stringify({
          id: credential.id,
          rawId: bufferEncode(credential.rawId),
          type: credential.type,
          response: {
              attestationObject: bufferEncode(credential.response.attestationObject),
              clientDataJSON: bufferEncode(credential.response.clientDataJSON),
          },
      });

      // Send the credential to the server
      const response2 = await axios.post(`${API_URL}/register-admin-finish/${response.data.data.uuid}`, credentialJSON);

      return response2.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred, please try again');
    }
  },

  webauthnLogin: async (email: string) => {
    try {
      const response = await axios.post(`${API_URL}/login-admin-begin`, {
        email,
      });

      if (response.data.message === "Please check your email for an otp."){
        return response.data;
      }
      
      // if backend returns this message: "Error getting user credentials, please register for WebAuthn",
      // then do an automatic call to register function
      if (response.data.message === "Error getting user credentials, please register for WebAuthn") {
        const response3 = await AuthService.webauthnRegister(email);
        return response3;
      }

      response.data.data.options.publicKey.challenge = bufferDecode(response.data.data.options.publicKey.challenge);
      response.data.data.options.publicKey.allowCredentials.forEach(function (listItem: any) {
        listItem.id = bufferDecode(listItem.id)
      });

      const assertion: any = await navigator.credentials.get({ publicKey: response.data.data.options.publicKey });

      if (assertion === null) {
        throw new Error('No assertion returned');
      }

      const assertionJSON = JSON.stringify({
          id: assertion.id,
          rawId: bufferEncode(assertion.rawId),
          type: assertion.type,
          response: {
              authenticatorData: bufferEncode(assertion.response.authenticatorData),
              clientDataJSON: bufferEncode(assertion.response.clientDataJSON),
              signature: bufferEncode(assertion.response.signature),
              userHandle: bufferEncode(assertion.response.userHandle),
          },
      });
      
      // Send the assertion to the server
      const response2 = await axios.post(`${API_URL}/login-admin-finish${response.data.data.uuid}`, assertionJSON);

      return response2.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
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
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error('An unexpected error occurred Whilst Logging out');
    }
  },

  getUserDetails : async (email: string) => {
    try {
      console.log(API_USER_URL);
      const response = await axios.get(`${API_USER_URL}/user-details?email=${email}`, {
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

function bufferEncode(value: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function bufferDecode(value: string | null): Uint8Array | null {
  if (value === null) {
    return null;
  }

  // Replace URL-safe characters with standard Base64 characters
  value = value.replace(/-/g, '+').replace(/_/g, '/');

  // Add necessary padding
  while (value.length % 4) {
    value += '=';
  }

  // Decode Base64 string
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}


export default AuthService;