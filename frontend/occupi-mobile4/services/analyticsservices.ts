import { Success, Unsuccessful } from "@/models/response";
import { AnalyticsReq } from "@/models/requests";
// import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import axios, { AxiosError } from 'axios';


export async function getAnalytics(req: AnalyticsReq, endpoint: string): Promise<Success | Unsuccessful> {
  let authToken = await SecureStore.getItemAsync('Token');
  let email = await SecureStore.getItemAsync('Email');
  try {
    const response = await axios.get(`https://dev.occupi.tech/analytics/${endpoint}?email=${email}`, {
      params: req,
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

// getAnalytics({}, 'user-hours');
