import { Success, Unsuccessful } from "@/models/response";
import { SecuritySettingsReq, NotificationSettingsReq } from "@/models/requests";
// import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import axios, { AxiosError } from 'axios';

export const getUserDetails = async (email: string, authToken: string): Promise<Success | Unsuccessful> => {
  try {
    const response = await axios.get("https://dev.occupi.tech/api/user-details", {
      params: { email },
      headers: { Authorization: authToken },
    });
    return response.data as Success;
  } catch (error) {
    console.error(`Error in getUserDetails:`, error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<Unsuccessful>;
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
    }
    return {
      data: null,
      status: 'error',
      message: 'An unexpected error occurred',
      error: {
        code: 'UNKNOWN_ERROR',
        details: 'An unexpected error occurred',
        message: 'An unexpected error occurred'
      }
    };
  }
};

export async function getNotificationSettings(email: string): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    // console.log(authToken);
    try {
        const response = await axios.get(`https://dev.occupi.tech/api/get-notification-settings`, {
            params: {
                email: email
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${authToken}`
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
   } catch (error) {
  console.error(`Error in ${Function}:`, error);
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as Unsuccessful;
  }
  return {
    data: null,
    status: 'error',
    message: 'An unexpected error occurred',
    error: {
      code: 'UNKNOWN_ERROR',
      details: 'An unexpected error occurred',
      message: 'An unexpected error occurred'
    }
  } as Unsuccessful;
}
}

export const getUserBookings = async (email: string) => {
    try {
      const authToken = await SecureStore.getItemAsync("authToken");
      if (!authToken) {
        console.error("No auth token found");
        return { success: false, message: "Authentication failed" };
      }
      const response = await axios.get(
        `https://dev.occupi.tech/api/view-bookings?filter={"email":"${email}"}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in getUserBookings:", error);
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, message: "An unexpected error occurred" };
    }
  };

// getUserBookings('kamogelomoeketse@gmail.com');

export async function getSecuritySettings(email: string): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    // console.log(authToken);
    try {
        const response = await axios.get(`https://dev.occupi.tech/api/get-security-settings`, {
            params: {
                email: email
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${authToken}`
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
   } catch (error) {
  console.error(`Error in ${Function}:`, error);
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as Unsuccessful;
  }
  return {
    data: null,
    status: 'error',
    message: 'An unexpected error occurred',
    error: {
      code: 'UNKNOWN_ERROR',
      details: 'An unexpected error occurred',
      message: 'An unexpected error occurred'
    }
  } as Unsuccessful;
}
}

export async function updateSecuritySettings(req: SecuritySettingsReq): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.post("https://dev.occupi.tech/api/update-security-settings", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
   } catch (error) {
  console.error(`Error in ${Function}:`, error);
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as Unsuccessful;
  }
  return {
    data: null,
    status: 'error',
    message: 'An unexpected error occurred',
    error: {
      code: 'UNKNOWN_ERROR',
      details: 'An unexpected error occurred',
      message: 'An unexpected error occurred'
    }
  } as Unsuccessful;
}
}

export async function updateNotificationSettings(req: NotificationSettingsReq): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.get("https://dev.occupi.tech/api/update-notification-settings", {
            params: {
                req
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
   } catch (error) {
  console.error(`Error in ${Function}:`, error);
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as Unsuccessful;
  }
  return {
    data: null,
    status: 'error',
    message: 'An unexpected error occurred',
    error: {
      code: 'UNKNOWN_ERROR',
      details: 'An unexpected error occurred',
      message: 'An unexpected error occurred'
    }
  } as Unsuccessful;
}
}