// src/components/RealTimeCounter.tsx
import { useEffect, useRef, useState } from "react";
import { Centrifuge } from "centrifuge";
import { initializeCentrifugo } from "CapacityService"; // Adjust the path as necessary

const RealTimeCounter = () => {
  const [counter, setCounter] = useState<number>(0);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  useEffect(() => {
    try {
      // Initialize Centrifugo connection
      //   centrifugeRef.current = initializeCentrifugo();
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjUxMTU0MDgsImlhdCI6MTcyNTExMTgwOCwic3ViIjoicnRjVG9rZW4ifQ.-FVHR3SASqhpFLL1EdqATkiF2mEobRz4dJFKfEy0CUg"; // getJWTToken();
      centrifugeRef.current = new Centrifuge(
        "ws://localhost:8001/connection/websocket",
        { token: token }
      );
      const RTC = centrifugeRef.current;
      RTC.on("connected", () => {
        console.log("Connected to Centrifugo");
      });
      RTC.connect();
      const sub = RTC.newSubscription("occupi-counter");
      sub.on("publication", (msg) => {
        console.log("Received message:", msg);
        setCounter(msg.data.value);
      });
      sub.subscribe();
    } catch (error) {
      console.error("Failed to initialize Centrifugo:", error);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Real-Time Counter</h1>
      <div className="text-2xl">
        Current Counter Value: <span className="font-mono">{counter}</span>
      </div>
    </div>
  );
};

export default RealTimeCounter;
