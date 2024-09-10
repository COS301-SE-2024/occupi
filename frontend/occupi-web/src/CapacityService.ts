// src/services/capacityService.ts

import axios from "axios";
import {
  Centrifuge,
  Subscription,
  PublicationContext,
  SubscribedContext,
  SubscriptionErrorContext,
} from "centrifuge";
import AuthService from "./AuthService";

interface ResponseItem {
  Date: string;
  Day_of_Week: number;
  Day_of_month: number;
  Is_Weekend: boolean;
  Month: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
  Special_Event: number;
}

export interface CapacityData {
  day: string;
  predicted: number;
  date: string;
  dayOfMonth: number;
  isWeekend: boolean;
  month: number;
  predictedClass: number;
  specialEvent: boolean;
}

const API_URL = "https://ai.occupi.tech/predict_week";

const convertRangeToNumber = (range: string) => {
  if (!range) return 0;
  const [min, max] = range.split("-").map(Number);
  return (min + max) / 2;
};

const getDayName = (dayOfWeek: number): string => {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dayOfWeek];
};

export const fetchCapacityData = async (): Promise<CapacityData[]> => {
  try {
    const response = await axios.get<ResponseItem[]>(API_URL);
    return response.data.map((item: ResponseItem) => ({
      day: getDayName(item.Day_of_Week),
      predicted: convertRangeToNumber(item.Predicted_Attendance_Level),
      date: item.Date,
      dayOfMonth: item.Day_of_month,
      isWeekend: item.Is_Weekend,
      month: item.Month,
      predictedClass: item.Predicted_Class,
      specialEvent: item.Special_Event === 1,
    }));
  } catch (error) {
    console.error("Error fetching capacity data:", error);
    throw error;
  }
};

// Additional function to get only the data needed for the CapacityComparisonGraph
export const getCapacityComparisonData = async (): Promise<
  Pick<CapacityData, "day" | "predicted">[]
> => {
  const fullData = await fetchCapacityData();
  return fullData.map(({ day, predicted }) => ({ day, predicted }));
};
// Helper function to get a cookie value by name
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

// Singleton pattern for Centrifuge instance management
let centrifuge: Centrifuge | null = null;
const subscriptions: { [key: string]: Subscription | undefined } = {};

// Function to initialize or update Centrifuge with a new token
const initCentrifuge = async () => {
  try {
    // Check for existing token in cookies
    let token = getCookie("rtc-token");
    // If no token is found in cookies, fetch a new one
    if (!token) {
      const response = await AuthService.getToken();
      token = response; // Assuming the response has a 'token' field
      console.log("Received RTC token:", token);
    }

    if (!token) {
      throw new Error("Failed to retrieve a valid RTC token");
    }
    if (!centrifuge) {
      centrifuge = new Centrifuge("ws://localhost:8001/connection/websocket", {
        token: token,
        debug: true,
      });

      // Add event listeners
      centrifuge.on("connected", (ctx) => {
        console.log("Connected to Centrifuge:", ctx);
      });

      centrifuge.on("disconnected", (ctx) => {
        console.log("Disconnected from Centrifuge:", ctx.reason);
      });

      centrifuge.on("error", (err) => {
        console.error("Centrifuge error:", err);
      });
    } else {
      centrifuge.setToken(token);
      centrifuge.connect(); // Reconnect with the new token
    }
  } catch (error) {
    console.error("Error initializing Centrifuge:", error);
  }
};

// Function to get the existing Centrifuge instance
export const getCentrifugeInstance = (): Centrifuge | null => {
  if (!centrifuge) {
    initCentrifuge(); // Ensure Centrifuge is initialized
  }
  return centrifuge;
};

// Function to explicitly connect Centrifuge
export const connectCentrifuge = () => {
  const centrifuge = getCentrifugeInstance();
  if (centrifuge && centrifuge.state !== "connected") {
    centrifuge.connect();
    console.log("Connected to Centrifuge");
    centrifuge.newSubscription("occupi-counter").subscribe();
    console.log("Connected to channel: occupi-counter");
  }
};

// Function to explicitly disconnect Centrifuge
export const disconnectCentrifuge = () => {
  if (centrifuge) {
    centrifuge.disconnect();
  }
};

// Define specific types for handlers
interface SubscriptionHandlers {
  onPublication?: (ctx: PublicationContext) => void;
  onSubscribed?: (ctx: SubscribedContext) => void; // Correct type for onSubscribed
  onError?: (ctx: SubscriptionErrorContext) => void; // Correct type for onError
}

// Function to subscribe to a channel with duplicate subscription prevention
export const subscribeToChannel = (
  channelName: string,
  handlers: SubscriptionHandlers
): Subscription | undefined => {
  const centrifuge = getCentrifugeInstance();

  // Check if already subscribed to the channel
  if (subscriptions[channelName]) {
    console.warn(`Already subscribed to channel: ${channelName}`);
    return subscriptions[channelName];
  }

  // Create a new subscription
  const subscription = centrifuge?.newSubscription(channelName);
  console.log(`Creating subscription to channel: ${channelName}`);
  // Attach provided event handlers to the subscription
  if (handlers?.onPublication) {
    subscription?.on("publication", handlers.onPublication);
  }

  if (handlers?.onSubscribed) {
    subscription?.on("subscribed", handlers.onSubscribed);
  }

  if (handlers?.onError) {
    subscription?.on("error", handlers.onError);
  }

  // Store the subscription in the map to prevent duplicate subscriptions
  subscriptions[channelName] = subscription;

  // Activate the subscription
  subscription?.subscribe();
  console.log(`Subscribed to channel: ${channelName}`);
  return subscription;
};

// Export initCentrifuge to be called as needed, such as on app startup
export default initCentrifuge;
