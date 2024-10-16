import { Success, Unsuccessful } from "@/models/response";
import { SecuritySettingsReq, NotificationSettingsReq, CheckInReq, CancelBookingReq, BookRoomReq, NotificationsReq, UpdateDetailsReq, ViewRoomsReq, ViewBookingsReq, AnalyticsReq, OnSiteReq, DeleteNotiRequest } from "@/models/requests";
// import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import axios, { AxiosError } from 'axios';
import { storeUserData } from "./securestore";
export const getUserDetails = async (email: string, authToken: string): Promise<Success | Unsuccessful> => {
  console.log('AuuuthToken1',authToken);
  try {
    const response = await axios.get("https://dev.occupi.tech/api/user-details", {
      params: { email },
      headers: { Authorization: authToken },
    });
    return response.data as Success;
  } catch (error) {
    // console.error(`Error in getUserDetails:`, error);
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

export async function toggleOnSite(req: OnSiteReq): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  console.log(req);
  try {
    const response = await axios.put("https://dev.occupi.tech/api/toggle-onsite", 
      req,
      {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
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

export async function getRooms(req: ViewRoomsReq): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  try {
    const response = await axios.get("https://dev.occupi.tech/api/view-rooms", {
      params: req,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    return response.data as Success;
  } catch (error) {
    // console.error(`Error in ${Function}:`, error);
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

export async function getNotificationSettings(email: string): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  console.log('AuuuthToken',authToken);
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
    console.error(`Error in fethcing Notification Settings:`, error);
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

export const getUserBookings = async (req: ViewBookingsReq): Promise<Success | Unsuccessful> => {
  try {
    const authToken = await SecureStore.getItemAsync("Token");
    if (!authToken) {
      return {
        data: null,
        status: 'error',
        message: 'Authentication failed',
        error: {
          code: 'AUTH_ERROR',
          details: 'No authentication token found',
          message: 'Authentication failed'
        }
      };
    }
    // console.log(req.filter.email);
    const response = await axios.get(
      `https://dev.occupi.tech/api/view-bookings?filter={"email":"kamogelomoeketse@gmail.com"}`,
      {
        params: req,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        withCredentials: true,
      }
    );
    // console.log("bookings",response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
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
};

export async function getNotifications(req: NotificationsReq): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  // console.log("request",req);
  try {
    const response = await axios.get("https://dev.occupi.tech/api/get-notifications", {
      params: req,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
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

export async function getTopBookings(): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  console.log('bookings authtoken',authToken);
  try {
    const response = await axios.get("https://dev.occupi.tech/analytics/top-bookings", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
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

export async function checkin(req: CheckInReq): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  console.log(req);
  try {
    const response = await axios.post("https://dev.occupi.tech/api/check-in", req, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    return response.data as Success;
  } catch (error) {
    console.error(`Error in ${Function}:`, error);
    if (axios.isAxiosError(error) && error.response?.data) {
      console.log(error.response.data)
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

export async function updateUserDetails(req: UpdateDetailsReq): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  console.log('token',authToken);
  try {
    const response = await axios.post("https://dev.occupi.tech/api/update-user", req, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    storeUserData(JSON.stringify(req));
    return response.data as Success;
  } catch (error) {
    console.error(`Error in ${Function}:`, error);
    if (axios.isAxiosError(error) && error.response?.data) {
      console.log(error.response.data)
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

export async function bookRoom(req: BookRoomReq): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  console.log(req);
  try {
    const response = await axios.post("https://dev.occupi.tech/api/book-room", req, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    return response.data as Success;
  } catch (error) {
    console.error(`Error in ${Function}:`, error);
    if (axios.isAxiosError(error) && error.response?.data) {
      console.log(error.response.data)
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

export async function cancelBooking(req: CancelBookingReq): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  console.log(req);
  try {
    const response = await axios.post("https://dev.occupi.tech/api/cancel-booking", req, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    return response.data as Success;
  } catch (error) {
    console.error(`Error in ${Function}:`, error);
    if (axios.isAxiosError(error) && error.response?.data) {
      console.log(error.response.data)
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

export async function getExpoPushTokens(attendees: string[]): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  console.log('emails',attendees);
  try {
  const response = await axios.get(`https://dev.occupi.tech/api/get-push-tokens?emails=${attendees}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `${authToken}`
      },
      withCredentials: true
    });
    console.log('push tokens',response.data);
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

export const removeNotification = async (req: DeleteNotiRequest): Promise<Success | Unsuccessful> => {
  const authToken = await SecureStore.getItemAsync('Token');
  
  // Check for undefined or empty values
  if (!req.email || !req.notiId) {
    console.log('Invalid request parameters:', req);
    return {
      status: 'error',
      data: null,
      message: 'Invalid request parameters',
      error: {
        code: 'INVALID_PARAMETERS',
        details: 'Email or notiId is missing or empty',
        message: 'Invalid request parameters'
      }
    };
  }

  try {
    const response = await axios.delete(`https://dev.occupi.tech/api/delete-notification`, {
      data: req,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    console.log('Delete request:', req);
    return response.data as Success;
  } catch (error) {
    console.log("Failed delete request:", req);
    if (axios.isAxiosError(error) && error.response?.data) {
      console.log("Full error response:", error.response.data);
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
};

// AI Recommendations
export async function getRecommendations() {
  let authToken = await SecureStore.getItemAsync('Token');
  try {
    const response = await axios.get("https://ai.occupi.tech/recommend", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    console.log(response.data)
    return response.data as Success;
  } catch (error) {
    console.error("Error in getRecommendations:", error);
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

// AI Office Time Recommendations
export async function recommendOfficeTimes() {
  let authToken = await SecureStore.getItemAsync('Token');
  try {
    const response = await axios.get("https://ai.occupi.tech/recommend_office_times", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    console.log("Recommendated ===========", response.data)
    return response.data as Success;
  } catch (error) {
    console.error("Error in recommendOfficeTimes:", error);
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

// Predict Day Occupancy
export async function predictDay(date: string, startHour: number, endHour: number): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  try {
    const response = await axios.get(`https://ai.occupi.tech/predict_day`, {
      params: { date, start_hour: startHour, end_hour: endHour },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    return response.data as Success;
  } catch (error) {
    console.error("Error in predictDay:", error);
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

// Predict Hourly Occupancy
export async function predictHourly(date: string, hour: number): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  try {
    const response = await axios.get(`https://ai.occupi.tech/predict_hourly`, {
      params: { date, hour },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });
    return response.data as Success;
  } catch (error) {
    console.error("Error in predictHourly:", error);
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
