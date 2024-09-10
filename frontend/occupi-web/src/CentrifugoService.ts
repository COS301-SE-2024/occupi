// centrifugeSingleton.js
import { Centrifuge } from "centrifuge";
import AuthService from "./AuthService"; // Adjust the path as necessary

let centrifuge = Centrifuge :| null;
const subscriptions = {}; // Object to track active subscriptions

// Function to initialize or update Centrifuge with a new token
const initCentrifuge = async () => {
  try {
    const response = await AuthService.getToken();
    const token = response.token;

    if (!centrifuge) {
      centrifuge = new Centrifuge("ws://localhost:8001/connection/websocket", {
        token: token,
        debug: true,
      });

      // Add connection event listeners
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
      centrifuge.connect();
    }
  } catch (error) {
    console.error("Error initializing Centrifuge:", error);
  }
};

// Function to get the Centrifuge instance, ensuring only one instance exists
export const getCentrifugeInstance = () => {
  if (!centrifuge) {
    initCentrifuge();
  }
  return centrifuge;
};

// Function to subscribe to a channel with duplicate subscription prevention
export const subscribeToChannel = (channelName, handlers) => {
  const centrifuge = getCentrifugeInstance();

  // Check if already subscribed to the channel
  if (subscriptions[channelName]) {
    console.warn(`Already subscribed to channel: ${channelName}`);
    return subscriptions[channelName];
  }

  // Create a new subscription
  const subscription = centrifuge.newSubscription(channelName);

  // Attach provided event handlers to the subscription
  if (handlers?.onPublication) {
    subscription.on("publication", handlers.onPublication);
  }

  if (handlers?.onSubscribed) {
    subscription.on("subscribed", handlers.onSubscribed);
  }

  if (handlers?.onError) {
    subscription.on("error", handlers.onError);
  }

  // Store the subscription in the map to prevent duplicate subscriptions
  subscriptions[channelName] = subscription;

  // Activate the subscription
  subscription.subscribe();
  console.log(`Subscribed to channel: ${channelName}`);
  return subscription;
};

// Function to explicitly connect Centrifuge
export const connectCentrifuge = () => {
  const centrifuge = getCentrifugeInstance();
  if (centrifuge && centrifuge.state !== "connected") {
    centrifuge.connect();
  }
};

// Function to explicitly disconnect Centrifuge
export const disconnectCentrifuge = () => {
  if (centrifuge) {
    centrifuge.disconnect();
  }
};

export default initCentrifuge;
