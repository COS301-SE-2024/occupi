// OverviewComponent.js
import { Uptrend, Cal, DownTrend, Bf } from "@assets/index";
import {
  BarGraph,
  GraphContainer,
  Line_Chart,
  StatCard,
  Header,
} from "@components/index";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getCentrifugeInstance,
  connectCentrifuge,
  disconnectCentrifuge,
} from "CapacityService";
import { Centrifuge } from "centrifuge";

const OverviewComponent = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let centrifuge: Centrifuge | null = null;

    const init = async () => {
      centrifuge = new Centrifuge(, {
        debug: true,
      });
      centrifuge.connect();
    };
    // Subscribe to the channel
    const subscription = centrifuge?.newSubscription("occupi-counter");

    subscription?.on("publication", (ctx) => {
      console.log("Received message:", ctx.data);
      // Update counter state with the new value received from Centrifugo
      if (ctx.data && ctx.data.counter !== undefined) {
        setCounter(ctx.data.counter);
      }
    });

    subscription?.on("subscribed", (ctx) => {
      console.log("Subscribed to channel:", ctx);
    });

    subscription?.on("error", (err) => {
      console.error("Subscription error:", err);
    });

    subscription?.subscribe(); // Activate the subscription

    // Connect to Centrifuge
    connectCentrifuge();

    // Cleanup function to disconnect Centrifuge when the component unmounts
    return () => {
      console.log("Disconnecting Centrifuge");
      disconnectCentrifuge();
    };
  }, []);

  return (
    <div className="">
      <Header />
      {/* <OccupiLoader/> */}

      <div className="w-11/12 mr-auto ml-auto">
        <div className="lg:flex md:flex-row sm:flex-row gap-10 mt-10">
          <GraphContainer
            width="55vw"
            height="500px"
            mainComponent={
              <div className="mt-4">
                <Line_Chart />
              </div>
            }
          />

          <StatCard
            width="18rem"
            height="100%"
            icon={<img src={Cal} alt="Calendar" />}
            title="Total bookings today"
            count="143 people"
            trend={{
              icon: <Uptrend />,
              value: "2.8%",
              direction: "up",
            }}
            comparisonText="Up from yesterday"
          />
        </div>
      </div>

      <motion.div className="flex w-11/12 mr-auto ml-auto h-8 text-text_col text-3xl font-semibold leading-none mt-10 items-center cursor-auto">
        Most Visitations <ChevronRight size={24} className="mt-2" />
      </motion.div>

      <div className="lg:flex md:flex-row sm:flex-row mt-5 mb-5 gap-10 w-11/12 mr-auto ml-auto">
        <GraphContainer
          width="55vw"
          height="500px"
          mainComponent={
            <div className="mt-8">
              <BarGraph />
            </div>
          }
        />

        <StatCard
          width="18rem"
          height="100%"
          icon={<img src={Bf} alt="Building" />}
          title="Total visitations today"
          count={`${counter} people`}
          trend={{
            icon: <DownTrend />,
            value: "4.3%",
            direction: "down",
          }}
          comparisonText="Down from yesterday"
        />
      </div>
    </div>
  );
};

export default OverviewComponent;
