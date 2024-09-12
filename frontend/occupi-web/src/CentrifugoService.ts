import { useState, useEffect, useRef } from "react";
import { Centrifuge, Subscription, PublicationContext } from "centrifuge";
import AuthService from "./AuthService"; // Adjust import paths as necessary
import axios from "axios"; // Assuming axios is used for API calls

let centrifuge: Centrifuge | null = null; // Singleton instance of Centrifuge
const CENTRIFUGO_URL = "ws://localhost:8001/connection/websocket"; // Adjust the URL to match your Centrifugo server
const RTC_URL = "/rtc";
// Helper function to get a cookie value by name
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

// Function to fetch or retrieve a valid RTC token
const fetchToken = async (): Promise<string> => {
  let token = getCookie("rtc-token");

  if (!token) {
    const response = await AuthService.getToken();
    token = response; // Assuming the response returns the token directly
    console.log("Received RTC token:", token);
  }

  if (!token) {
    throw new Error("Failed to retrieve a valid RTC token");
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
  try {
    const response = await axios.get(`${RTC_URL}/current-count`); // Adjust the URL to match your API endpoint
    console.log(response);
    return response.data.data; // Assuming the API response has a 'count' field
  } catch (error) {
    console.error("Error fetching the latest count:", error);
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
