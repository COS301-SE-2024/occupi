import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { EyeIcon } from "@assets/index";
import {
  WeeklyAttendanceChart,
  OfficePresent,
  OccupancyRatingChart,
  KeyStats,
  ProfileComponent
} from "@components/index";
import UserHoursChart from '@components/userStats/UserHoursChart';

interface User {
  id: string;
  name: string;
  role: string;
  team: string;
  status: string;
  email: string;
  bookings: number;
  avatar: string;
}

interface Booking {
  id: string;
  floor: string;
  date: string;
  // Add other relevant fields
}

interface OccupancyModalProps {
  user: User;
}

export default function OccupancyModal({ user }: OccupancyModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryString = `operator=eq&filter[email]=${encodeURIComponent(user.email)}&limit=50&page=1`;

      const response = await fetch(`/api/view-bookings?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data);
    } catch (err) {
      setError('Error fetching bookings. Please try again.');
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen]);

  return (
    <>
      <div onClick={onOpen}>
        <EyeIcon />
      </div>
      <Modal
        size="5xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {user.name}'s Office Occupancy Stats
              </ModalHeader>
              <ModalBody className="text-text_col">
                <div className="flex flex-col gap-6">
                  {/* User Profile and Key Stats Section */}
                  <div className="border flex justify-between items-start bg-secondary p-4 rounded-lg">
                    <ProfileComponent 
                      profileImage={user.avatar}
                      email={user.email}
                      name={user.name}
                      officeStatus={user.status.toLowerCase() as "onsite" | "offsite" | "booked"}
                    />
                    <KeyStats />
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border bg-secondary p-4 rounded-lg shadow">
                      <WeeklyAttendanceChart />
                    </div>
                    <div className="border bg-secondary p-4 rounded-lg shadow">
                      <OfficePresent />
                    </div>
                    <div className="border bg-secondary p-4 rounded-lg shadow col-span-2">
                      <OccupancyRatingChart />
                    </div>
                  </div>

                  {/* Bookings Section */}
                  <div className="border bg-secondary p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                    {isLoading ? (
                      <p>Loading bookings...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : bookings.length > 0 ? (
                      <ul className="space-y-2">
                        {bookings.map((booking) => (
                          <li key={booking.id} className="flex justify-between items-center">
                            <span>Floor: {booking.floor}</span>
                            <span>Date: {new Date(booking.date).toLocaleDateString()}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No recent bookings found.</p>
                    )}
                  </div>
                </div>

                <UserHoursChart email={user.email} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  className="text-text_col_alt bg-secondary_alt"
                  onPress={onClose}
                >
                  Download Report
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}