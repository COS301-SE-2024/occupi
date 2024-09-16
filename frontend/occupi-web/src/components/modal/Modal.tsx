import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { EyeIcon } from "@assets/index";
import { ProfileComponent } from "@components/index";
import UserStatsComponent from "@pages/visitations/Visitations";
import UserHoursCharts from "@pages/visitations/userHoursCharts";
import UserWorkRatioChart from "@pages/visitations/UserWorkRatioChart";
import UserPeakOfficeHoursChart from "@pages/visitations/UserPeakOfficeHoursChart";
import AvgArrDep from "@pages/visitations/AvgArrDep";
import { motion } from "framer-motion";
import * as userStatsService from 'userStatsService';
import { AI_loader } from "@assets/index";
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
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleToggle = (key: string) => {
    setOpenItems((prevOpenItems) =>
      prevOpenItems.includes(key)
        ? prevOpenItems.filter((item) => item !== key)
        : [...prevOpenItems, key]
    );
  };

  const accordionVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1 },
  };

  const generateReport = async () => {
    setIsDownloading(true);
    try {
      const params = {
        email: user.email,
        timeFrom: '2024-01-01T00:00:00.000Z',
        timeTo: '2024-09-11T00:00:00.000Z',
      };

      const [userHours, userWorkRatio, userArrivalDepartureAverage, userPeakOfficeHours] = await Promise.all([
        userStatsService.getUserHours(params),
        userStatsService.getUserWorkRatio(params),
        userStatsService.getUserArrivalDepartureAverage(params),
        userStatsService.getUserPeakOfficeHours(params),
      ]);

      const reportData = {
        userName: user.name,
        userEmail: user.email,
        dailyHours: userHours.data,
        workRatio: userWorkRatio.data[0],
        arrivalDeparture: userArrivalDepartureAverage.data[0],
        peakHours: userPeakOfficeHours.data[0],
      };

      const reportContent = `
User Statistics Report for ${reportData.userName} (${reportData.userEmail})

1. Work Ratio: ${reportData.workRatio.ratio.toFixed(2)}

2. Average Arrival and Departure Times:
   Overall Average Arrival: ${reportData.arrivalDeparture.overallavgArrival}
   Overall Average Departure: ${reportData.arrivalDeparture.overallavgDeparture}

3. Daily Hours Summary:
${reportData.dailyHours.map(day => `   ${day.date}: ${day.totalHours.toFixed(2)} hours`).join('\n')}

4. Peak Office Hours:
${reportData.peakHours.days.map((day: { weekday: any; hours: any[]; }) => `   ${day.weekday}: ${day.hours.join(', ')}`).join('\n')}

5. Work Ratio by Day:
${reportData.workRatio.days.map((day: { weekday: any; ratio: number; }) => `   ${day.weekday}: ${day.ratio.toFixed(2)}`).join('\n')}

6. Arrival and Departure Times by Day:
${reportData.arrivalDeparture.days.map((day: { weekday: any; avgArrival: any; avgDeparture: any; }) => `   ${day.weekday}: Arrival - ${day.avgArrival}, Departure - ${day.avgDeparture}`).join('\n')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${user.name}_stats_report.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsDownloading(false);
    }
  };

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
                  <div className="border flex items-center justify-between bg-secondary px-12 py-4 rounded-lg">
                    <ProfileComponent
                      profileImage={user.avatar}
                      email={user.email}
                      name={user.name}
                      officeStatus={user.status.toLowerCase() as "onsite" | "offsite" | "booked"}
                    />
                    <UserStatsComponent email={user.email} />
                  

                  </div>

                  <Accordion>
                    <AccordionItem
                      key="1"
                      aria-label="User Hours Chart"
                      title="User Hours Chart"
                      onClick={() => handleToggle("1")}
                    >
                      {openItems.includes("1") && (
                        <motion.div
                          className="border bg-secondary p-4 rounded-lg"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={accordionVariants}
                          transition={{ duration: 0.3 }}
                        >
                          <UserHoursCharts email={user.email} />
                        </motion.div>
                      )}
                    </AccordionItem>
                    <AccordionItem
                      key="2"
                      aria-label="Work Ratio Chart"
                      title="Work Ratio Chart"
                      onClick={() => handleToggle("2")}
                    >
                      {openItems.includes("2") && (
                        <motion.div
                          className="border bg-secondary p-4 rounded-lg"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={accordionVariants}
                          transition={{ duration: 0.3 }}
                        >
                          <UserWorkRatioChart email={user.email} />
                        </motion.div>
                      )}
                    </AccordionItem>
                    <AccordionItem
                      key="3"
                      aria-label="Average Arrival and Departure"
                      title="Average Arrival and Departure"
                      onClick={() => handleToggle("3")}
                    >
                      {openItems.includes("3") && (
                        <motion.div
                          className="border bg-secondary p-4 rounded-lg"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={accordionVariants}
                          transition={{ duration: 0.3 }}
                        >
                          <AvgArrDep email={user.email} />
                        </motion.div>
                      )}
                    </AccordionItem>
                    <AccordionItem
                      key="4"
                      aria-label="Peak Office Hours Chart"
                      title="Peak Office Hours Chart"
                      onClick={() => handleToggle("4")}
                    >
                      {openItems.includes("4") && (
                        <motion.div
                          className="border bg-secondary p-4 rounded-lg"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={accordionVariants}
                          transition={{ duration: 0.3 }}
                        >
                          <UserPeakOfficeHoursChart email={user.email} />
                        </motion.div>
                      )}
                    </AccordionItem>
                  </Accordion>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  className="text-text_col_alt bg-secondary_alt"
                  onPress={generateReport}
                  isLoading={isDownloading}
                >
                  {isDownloading ? 'Generating Report...' : 'Download Report'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}