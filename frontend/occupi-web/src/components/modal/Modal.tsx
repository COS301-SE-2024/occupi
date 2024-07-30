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

interface OccupancyModalProps {
  user: User;
}

export default function OccupancyModal({ user }: OccupancyModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
                  <div className=" border flex justify-between items-start bg-secondary p-4 rounded-lg">
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
                </div>
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