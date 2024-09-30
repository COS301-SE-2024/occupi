import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useCentrifugeCounter } from "CentrifugoService";

const OverviewComponent = () => {
  const counter = useCentrifugeCounter();
  const navigate = useNavigate();
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    const fetchTotalBookings = async () => {
      try {
        const response = await fetch('/analytics/top-bookings');
        const data = await response.json();
        const total = data.data.reduce((sum: number, booking: { count: number; }) => sum + booking.count, 0);
        setTotalBookings(total);
      } catch (err) {
        console.error('Failed to fetch total bookings:', err);
      }
    };

    fetchTotalBookings();
  }, []);

  const handleNavigateToBookingsDashboard = () => {
    navigate('/booking-statistics/bookings-dashboard');
  };

  return (
    <div className="">
      <Header />

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
            title="Total bookings"
            count={`${totalBookings} bookings`}
            trend={{
              icon: <Uptrend />,
              value: "2.8%",
              direction: "up",
            }}
            comparisonText="Up from last period"
            onClick={handleNavigateToBookingsDashboard}
          />
        </div>
      </div>

      <motion.div 
        className="flex w-11/12 mr-auto ml-auto h-8 text-text_col text-3xl font-semibold leading-none mt-10 items-center cursor-pointer"
        onClick={handleNavigateToBookingsDashboard}
      >
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
          onClick={handleNavigateToBookingsDashboard}

        />
      </div>
    </div>
  );
};

export default OverviewComponent;