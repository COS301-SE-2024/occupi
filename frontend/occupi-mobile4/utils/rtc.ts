import { useState, useEffect, useRef } from "react";
import { Centrifuge, Subscription, PublicationContext } from "centrifuge";
import * as SecureStore from 'expo-secure-store';
import { storeRTCToken } from "@/services/securestore";
import { getRTCToken } from "@/services/authservices";
import axios from "axios"; // Assuming axios is used for API calls
import { Success, Unsuccessful } from "@/models/response";

let centrifuge: Centrifuge | null = null; // Singleton instance of Centrifuge
const CENTRIFUGO_URL = "wss://dev.occupi.tech/connection"; // Adjust the URL to match your Centrifugo server
const RTC_URL = "/rtc";

const getTodaysDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to fetch or retrieve a valid RTC token
const fetchToken = async (): Promise<string | null> => {
  // Try to get the token from cookies
  console.log('fetching...');
  let token = await SecureStore.getItemAsync('rtc-token');
  console.log('tokennn',token);
  let tokentime = await SecureStore.getItemAsync('tokenTime');
  const todaysDate = getTodaysDate();
  // const response = await getRTCToken();
  console.log('yessir',tokentime);

  // If the token is not found in cookies, fetch it from the AuthService
  if (!token || tokentime !== todaysDate) {
    console.log("No RTC token found in cookies, fetching a new token...");
    try {
      const response = await getRTCToken();
      SecureStore.setItemAsync("tokenTime",todaysDate);
      console.log('responseee',response);
      token = response.data; // Assuming response directly returns the token
      storeRTCToken(token as string);
      // Check if the response is indeed a token and not empty
      if (token !== null) {
        // console.log("Received RTC token");
      } else {
        console.error("AuthService.getToken() returned an empty token");
        throw new Error("Failed to retrieve a valid RTC token");
      }
    } catch (error) {
    //   console.error("Error fetching RTC token:", error);
      throw new Error("Failed to retrieve a valid RTC token");
    }
  } else {
    console.log("RTC token found in cookies:", token);
  }
  return token;
};

// Function to initialize Centrifuge
const initCentrifuge = async () => {
  if (!centrifuge) {
    const token = await fetchToken();
    centrifuge = new Centrifuge(CENTRIFUGO_URL, {
      token,
      debug: true,
    });

    centrifuge.on("connected", (ctx: unknown) => {
      console.log("Connected to Centrifuge:", ctx);
    });

    centrifuge.on("disconnected", (ctx: unknown) => {
      console.log("Disconnected from Centrifuge:", ctx);
    });

    centrifuge.on("error", (err) => {
      console.error("Centrifuge error:", err);
    });

    centrifuge.connect();
  }
};

// Function to disconnect Centrifuge
const disconnectCentrifuge = () => {
  if (centrifuge) {
    centrifuge.disconnect();
    centrifuge = null; // Reset centrifuge instance
  }
};

// Function to fetch the latest count from the backend
const fetchLatestCount = async (): Promise<number> => {
  let authToken = await SecureStore.getItemAsync('Token');
  try {
    const response = await axios.get(`https://dev.occupi.tech/rtc/current-count`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      withCredentials: true
    });// Adjust the URL to match your API endpoint
    // console.log('current-countt:',`${CENTRIFUGO_URL}${RTC_URL}/current-count`);
    return response.data.data; // Assuming the API response has a 'count' field
  } catch (error) {
    // console.error("Error fetching the latest count:", error);
    return 0; // Default to 0 if there's an error
  }
};

// Custom hook to use Centrifuge for the 'occupi-counter' subscription
export const useCentrifugeCounter = () => {
  const [counter, setCounter] = useState<number>(0);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    // Function to subscribe to the counter channel and fetch the latest count
    const subscribeToCounter = async () => {
      await initCentrifuge();

      // Fetch the latest count immediately after connecting
      const latestCount = await fetchLatestCount();
      console.log('latest count: ', latestCount);
      setCounter(latestCount);

      // Only subscribe if not already subscribed
      if (!subscriptionRef.current && centrifuge) {
        const subscription = centrifuge.newSubscription("occupi-counter");

        subscription.on("publication", (ctx: PublicationContext) => {
          // Handle counter updates from the publication context
          const newCounter = ctx.data.counter;
          setCounter(newCounter);
        });

        subscription.subscribe();
        subscriptionRef.current = subscription; // Store the subscription in the ref
      }
    };

    subscribeToCounter();

    // Cleanup function to unsubscribe and disconnect Centrifuge on component unmount
    return () => {
      console.log("Cleaning up Centrifuge subscription and connection.");
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe(); // Unsubscribe from the channel
        subscriptionRef.current = null; // Clear the subscription reference
      }
      disconnectCentrifuge(); // Disconnect Centrifuge
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return counter;
};

export async function enter(): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    try {
    const response = await axios.get(`https://dev.occupi.tech/rtc/enter`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `${authToken}`
        },
        withCredentials: true
      });
      console.log('entered?',response.data);
      return response.data as Success;
    } catch (error) {
      console.error(`Error  in ${Function}:`, error);
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

  export async function exit(): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    try {
    const response = await axios.get(`https://dev.occupi.tech/rtc/exit`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `${authToken}`
        },
        withCredentials: true
      });
      console.log('exited?',response.data);
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