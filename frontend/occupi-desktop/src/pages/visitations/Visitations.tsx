import { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";

import {
  HistoricalBookingsBento,
  CurrentBookingsBento,
  TopBookingsBento,
} from "@components/index";

const BookingsDashboard = () => {
  const [selected, setSelected] = useState("top");

  return (
    <div className="flex flex-col w-auto ml-3">
      

      <Tabs
        className="mt-5"
        aria-label="Bookings tabs"
        selectedKey={selected}
        onSelectionChange={(key) => setSelected(key as string)}
      >
        <Tab key="top" title="Top Bookings">
          <TopBookingsBento />
        </Tab>
        <Tab key="current" title="Current Bookings">
          <CurrentBookingsBento />
        </Tab>
        <Tab key="historical" title="Historical Bookings">
          <HistoricalBookingsBento />
        </Tab>

      </Tabs>
    </div>
  );
};

export default BookingsDashboard;
