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
    // console.log('check', response.data);
    return response.data as Success;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // console.log('eish...: ', error.response);
      return {
        data: null,
        status: error.response.status.toString(),
        message: error.response.statusText,
        error: {
          code: error.response.status.toString(),
          details: error.response.data,
          message: error.response.data
        }
      } as Unsuccessful;
    } else {
      throw error;
    }
  }
}

// getAnalytics({}, 'user-hours');
