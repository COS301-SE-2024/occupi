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
  data: Booking[] | null;
  message: string;
  meta: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
  status: number;
}

const CurrentBookingsBento = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchRoom, setSearchRoom] = useState('');
  const [visibleBookings, setVisibleBookings] = useState(3);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/analytics/bookings-current');
        const data: ApiResponse = await response.json();
        if (data.data) {
          setBookings(data.data);
          setFilteredBookings(data.data);
        } else {
          setBookings([]);
          setFilteredBookings([]);
        }
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchData();
    
  }, []);


  

  useEffect(() => {
    if (searchRoom) {
      const filtered = bookings.filter(booking => 
        booking.roomName.toLowerCase().includes(searchRoom.toLowerCase())
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
    setVisibleBookings(3); // Reset visible bookings when filter changes
  }, [searchRoom, bookings]);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadMoreBookings = () => {
    setVisibleBookings(prevVisible => prevVisible + 3);
  };

  if (isLoading) return <Spinner label="Loading..." />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4 mt-5">
      <Input
        type="text"
        placeholder="Search by room name"
        value={searchRoom}
        onChange={(e) => setSearchRoom(e.target.value)}
        startContent={<Search className="text-default-400" />}
      />
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.slice(0, visibleBookings).map((booking) => (
            <Card key={booking.occupiID} className="w-full" shadow="sm">
              <CardHeader className="flex justify-between">
                <h4 className="text-large font-bold">{booking.roomName}</h4>
                <span className="text-small text-default-500">Floor {booking.floorNo}</span>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
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
                    <PopoverContent className="w-[300px] text-text_col">
                      <div className="px-1 py-2">
                        <h3 className="text-small font-bold text-text_col">Creator:</h3>
                        <p className="text-tiny text-text_col">{booking.creators}</p>
                        <h3 className="text-small font-bold mt-2">Participants:</h3>
                        <ul className="list-disc pl-4">
                          {booking.emails.map((email, i) => (
                            <li key={i} className="text-tiny">{email}</li>
                          ))}
                        </ul>
                        <p className="text-tiny mt-2 text-text_col">
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
      ) : (
        <Card>
          <CardBody>
            <p>No current bookings available.</p>
          </CardBody>
        </Card>
      )}
      {visibleBookings < filteredBookings.length && (
        <div className="flex justify-center mt-4">
          <Button onClick={loadMoreBookings} variant="flat">
            Load More Bookings
          </Button>
        </div>
      )}
    </div>
  );
};

export default CurrentBookingsBento;