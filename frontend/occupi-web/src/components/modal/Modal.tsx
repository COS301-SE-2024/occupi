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
import {
  ProfileComponent,
  UserStatsComponent,
  UserHoursCharts,
  UserWorkRatioChart,
  UserPeakOfficeHoursChart,
  AvgArrDep,
} from "@components/index";
import { motion } from "framer-motion";
import * as userStatsService from "userStatsService";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { occupiLogo } from "@assets/index"; // Assuming occupiLogo is an image asset
import NotificationService from "NotificationsService";

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

interface DayData {
  weekday: string;
  ratio: number;
  avgArrival: string;
  avgDeparture: string;
}

interface PeakHoursDay {
  weekday: string;
  hours: string[];
}

interface ReportData {
  userName: string;
  userEmail: string;
  dailyHours: Array<{ date: string; totalHours: number }>;
  workRatio: {
    ratio: number;
    days: DayData[];
  };
  arrivalDeparture: {
    overallavgArrival: string;
    overallavgDeparture: string;
    days: DayData[];
  };
  peakHours: {
    days: PeakHoursDay[];
  };
}

export default function OccupancyModal({ user }: OccupancyModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
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

  const fetchDataForReport = async () => {
    const params = {
      email: user.email,
      timeFrom: new Date("1970-01-01T00:00:00.000Z").toISOString(),
      timeTo: new Date().toISOString(),
    };

    const [
      userHours,
      userWorkRatio,
      userArrivalDepartureAverage,
      userPeakOfficeHours,
    ] = await Promise.all([
      userStatsService.getUserHours(params),
      userStatsService.getUserWorkRatio(params),
      userStatsService.getUserArrivalDepartureAverage(params),
      userStatsService.getUserPeakOfficeHours(params),
    ]);

    const data: ReportData = {
      userName: user.name,
      userEmail: user.email,
      dailyHours: userHours.data,
      workRatio: {
        ...userWorkRatio.data[0],
        days: userWorkRatio.data[0].days.map((day) => ({
          ...day,
          avgArrival: "", // Provide appropriate default or fetched value
          avgDeparture: "", // Provide appropriate default or fetched value
        })),
      },
      arrivalDeparture: {
        ...userArrivalDepartureAverage.data[0],
        days: userArrivalDepartureAverage.data[0].days.map((day) => ({
          ...day,
          ratio: 0, // Provide an appropriate default or fetched value for ratio
        })),
      },
      peakHours: userPeakOfficeHours.data[0],
    };

    setReportData(data);
  };

  const generateReportPDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={occupiLogo} />
          <Text style={styles.title}>User Statistics Report</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.text}>Name: {reportData?.userName}</Text>
          <Text style={styles.text}>Email: {reportData?.userEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Ratio</Text>
          <Text style={styles.text}>
            Overall Work Ratio: {reportData?.workRatio.ratio.toFixed(2)}
          </Text>
          {reportData?.workRatio.days.map((day, index) => (
            <Text key={index} style={styles.text}>
              {day.weekday}: {day.ratio.toFixed(2)}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arrival & Departure Times</Text>
          <Text style={styles.text}>
            Overall Average Arrival:{" "}
            {reportData?.arrivalDeparture.overallavgArrival}
          </Text>
          <Text style={styles.text}>
            Overall Average Departure:{" "}
            {reportData?.arrivalDeparture.overallavgDeparture}
          </Text>
          {reportData?.arrivalDeparture.days.map((day, index) => (
            <Text key={index} style={styles.text}>
              {day.weekday}: Arrival - {day.avgArrival}, Departure -{" "}
              {day.avgDeparture}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Hours</Text>
          {reportData?.dailyHours.map((day, index) => (
            <Text key={index} style={styles.text}>
              {day.date}: {day.totalHours.toFixed(2)} hours
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peak Office Hours</Text>
          {reportData?.peakHours.days.map((day, index) => (
            <Text key={index} style={styles.text}>
              {day.weekday}: {day.hours.join(", ")}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );

  const handleGenerateReport = async () => {
    setIsDownloading(true);
    try {
      await fetchDataForReport();
      await NotificationService.downloadPDFReport(user.email);
    } catch (error) {
      console.error("Error generating report:", error);
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
                      profileImage={`https://dev.occupi.tech/api/download-profile-image?email=${user.email}&quality=mid`}
                      email={user.email}
                      name={user.name}
                      officeStatus={
                        user.status.toLowerCase() as
                          | "onsite"
                          | "offsite"
                          | "booked"
                      }
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
                {reportData ? (
                  <Button className="bg-text_col_secondary_alt  ">
                    <PDFDownloadLink
                      className="text-text_col_alt bg-secondary-alt "
                      document={generateReportPDF()}
                      fileName={`${user.name}_Stats_Report.pdf`}
                    >
                      {/* @ts-expect-e */}
                    {({  loading, }) =>
                        loading ? "Report loading..." : "Report ready to download"
                    }
                    </PDFDownloadLink>
                  </Button>
                ) : (
                  <Button
                    className="text-text_col_alt bg-secondary_alt"
                    onPress={handleGenerateReport}
                    isLoading={isDownloading}
                  >
                    {isDownloading ? "Generating Report..." : "Generate Report"}
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "2 solid black",
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    textAlign: "right",
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
});
