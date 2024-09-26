import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Popover, PopoverTrigger, PopoverContent, Spinner } from "@nextui-org/react";
import { Calendar, Clock, Users, Search, ChevronDown } from 'lucide-react';

interface Booking {
  checkedIn: boolean;
  creators: string;
  date: string;
  emails: string[];
  end: string;
  floorNo: string;
  occupiID: string;
  roomId: string;
  roomName: string;
  start: string;
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

const HistoricalBookingsBento = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/analytics/bookings-historical');
        const data: ApiResponse = await response.json();
        setBookings(data.data);
        setFilteredBookings(data.data);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError('Failed to fetch data: ' + err.message);
        } else {
          setError('Failed to fetch data');
        }
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchDate) {
      const filtered = bookings.filter(booking => 
        booking.date.startsWith(searchDate)
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  }, [searchDate, bookings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) return <Spinner label="Loading..." />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4 mt-4">
      <Input
        type="date"
        placeholder="Search by date"
        value={searchDate}
        onChange={(e) => setSearchDate(e.target.value)}
        startContent={<Search className="text-default-400" />}
      />

      {/* Display a message if no bookings match the search criteria */}
      {filteredBookings.length === 0 && (
        <div>No bookings found for the selected date.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.slice(0, 3).map((booking) => (
          <Card key={booking.occupiID} className="w-full" shadow="sm">
            <CardHeader className="flex justify-between">
              <h4 className="text-large font-bold">{booking.roomName}</h4>
              <span className="text-small text-default-500">Floor {booking.floorNo}</span>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{formatTime(booking.start)} - {formatTime(booking.end)}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{booking.emails.length} participant(s)</span>
                </div>
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <Button
                      endContent={<ChevronDown className="h-4 w-4" />}
                      variant="flat"
                    >
                      View Details
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px]">
                    <div className="px-1 py-2">
                      <h3 className="text-small font-bold">Creator:</h3>
                      <p className="text-tiny">{booking.creators}</p>
                      <h3 className="text-small font-bold mt-2">Participants:</h3>
                      <ul className="list-disc pl-4">
                        {booking.emails.map((email, i) => (
                          <li key={i} className="text-tiny">{email}</li>
                        ))}
                      </ul>
                      <p className="text-tiny mt-2">
                        Checked In: {booking.checkedIn ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Only show "View More Bookings" if there are more than 3 bookings */}
      {filteredBookings.length > 3 && (
        <Popover placement="bottom">
          <PopoverTrigger>
            <Button
              endContent={<ChevronDown className="h-4 w-4" />}
              variant="flat"
            >
              View More Bookings
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px]">
            <div className="px-1 py-2 max-h-[400px] overflow-y-auto">
              {filteredBookings.slice(3).map((booking) => (
                <div key={booking.occupiID} className="mb-4">
                  <h3 className="text-small font-bold">{booking.roomName}</h3>
                  <p className="text-tiny">{formatDate(booking.date)}</p>
                  <p className="text-tiny">{formatTime(booking.start)} - {formatTime(booking.end)}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default HistoricalBookingsBento;
