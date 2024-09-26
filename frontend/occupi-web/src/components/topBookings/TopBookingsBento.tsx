import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Spinner, Button, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Users, Calendar, Building, ChevronDown } from 'lucide-react';

interface Booking {
  _id: string;
  count: number;
  creators: string[];
  emails: string[][];
  floorNo: string;
  roomName: string;
}

interface ApiResponse {
  data: Booking[];
  message: string;
  meta: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
  status: number;
}

const TopBookingsBento = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/analytics/top-bookings');
        const data: ApiResponse = await response.json();
        setBookings(data.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <Spinner label="Loading..." />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-3">
      {bookings.map((booking, index) => (
        <Card 
          key={booking._id} 
          className={`${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
          shadow="sm"
        >
          <CardHeader className="flex justify-between">
            <h4 className="text-large font-bold">{booking.roomName}</h4>
            <span className="text-small text-default-500">Floor {booking.floorNo}</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Bookings: {booking.count}</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Unique creators: {new Set(booking.creators).size}</span>
              </div>
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                <span>Total participants: {booking.emails.flat().length}</span>
              </div>
              <Popover placement="bottom">
                <PopoverTrigger>
                  <Button
                    endContent={<ChevronDown className="h-4 w-4" />}
                    variant="flat"
                  >
                    View Booking Details
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px]">
                  <div className="px-1 py-2">
                    <h3 className="text-small font-bold">Booking Creators:</h3>
                    <ul className="list-disc pl-4">
                      {Array.from(new Set(booking.creators)).map((creator, i) => (
                        <li key={i} className="text-tiny">{creator}</li>
                      ))}
                    </ul>
                    <h3 className="text-small font-bold mt-2">All Participants:</h3>
                    <ul className="list-disc pl-4">
                      {Array.from(new Set(booking.emails.flat())).map((email, i) => (
                        <li key={i} className="text-tiny">{email}</li>
                      ))}
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default TopBookingsBento;