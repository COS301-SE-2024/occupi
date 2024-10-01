import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image
} from "@react-pdf/renderer";
import { TopNav } from "@components/index";
import { occupiLogo } from "@assets/index";
import axios from "axios";

// Define the interface for the data
interface CapacityData {
  date: string;
  day: string;
  predicted: string;
  isWeekend: boolean;
  specialEvent: boolean;
}

interface ResponseItem {
  Date: string;
  Day_of_Week: number;
  Day_of_month: number;
  Is_Weekend: boolean;
  Month: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
  Special_Event: number;
}

// Sample data
const occupancyData = [
  { month: "January", occupancy: 60 },
  { month: "February", occupancy: 70 },
  { month: "March", occupancy: 75 },
  { month: "April", occupancy: 80 },
  { month: "May", occupancy: 85 },
  { month: "June", occupancy: 45 },
  { month: "July", occupancy: 95 },
  { month: "August", occupancy: 73 },
  { month: "September", occupancy: 81 },
  { month: "October", occupancy: 63 },
  { month: "November", occupancy: 85 },
  { month: "December", occupancy: 80 },
];

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
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
    marginVertical: 10,
  },
  paragraph: {
    marginVertical: 10,
    fontSize: 12,
    textAlign: "justify",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  tableHeader: {
    backgroundColor: "#f2f2f2",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
  chartContainer: {
    marginVertical: 20,
    width: "100%",
    height: 200,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
});

// summary data
const summaryText = `This report provides an in-depth analysis of the office occupancy trends over highlighting key areas for improvement and optimization based on AI-driven predictions.`;
function BasicDocument() {
// Mock additional data for the report
const [additionalData, setAdditionalData] = useState([
  { category: "Total Floors", value: 0 },
  { category: "Total Meeting Rooms", value: 0 },
  { category: "Average Desk Utilization", value: "0%" },
]);

useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, bookingsResponse] = await Promise.all([
          axios.get("/api/view-rooms"),
          axios.get("/analytics/top-bookings"),
        ]);

        if (roomsResponse.status !== 200 || bookingsResponse.status !== 200) {
          throw new Error("Network response was not ok");
        }

        const roomsData = roomsResponse.data.data;
        const bookingsData = bookingsResponse.data.data;

        if (!Array.isArray(roomsData) || !Array.isArray(bookingsData)) {
          throw new Error("Data is not in the expected format");
        }

        // Calculate total floors
        const totalFloors = new Set(roomsData.map(room => room.floorNo)).size;

        // Calculate total meeting rooms
        const totalMeetingRooms = roomsData.length;

        const totalOccupancy = bookingsData.reduce((sum, booking) => sum + booking.count, 0);
        const totalCapacity = roomsData.reduce((sum, room) => sum + (room.maxOccupancy || 0), 0);
        const averageUtilization = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

        setAdditionalData([
          { category: "Total Floors", value: totalFloors },
          { category: "Total Meeting Rooms", value: totalMeetingRooms },
          { category: "Average Desk Utilization", value: `${averageUtilization.toFixed(2)}%` },
        ]);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

// Create Document Component

  const [searchQuery, setSearchQuery] = useState("");
  const [capacityData, setCapacityData] = useState<CapacityData[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const handleInputChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ResponseItem[]>(
          "https://ai.occupi.tech/predict_week"
        );
        const formattedData = response.data.map((item: ResponseItem) => ({
          date: item.Date,
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][item.Day_of_Week],
          predicted: item.Predicted_Attendance_Level,
          isWeekend: item.Is_Weekend,
          specialEvent: item.Special_Event === 1,
        }));
        setCapacityData(formattedData);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMonthSelection = (month: string) => {
    setSelectedMonths((prevMonths) =>
      prevMonths.includes(month)
        ? prevMonths.filter((m) => m !== month)
        : [...prevMonths, month]
    );
  };

  const filteredOccupancyData = occupancyData.filter((data) =>
    selectedMonths.includes(data.month)
  );

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Reports
            <span className="block text-sm opacity-65  text-text_col_secondary_alt ">
              Generate and download reports for Analysis
            </span>
          </div>
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />

      {/* Month Filter */}
      <div className="flex flex-wrap mb-4">
        {occupancyData.map((data) => (
          <button
            key={data.month}
            className={`p-2 m-2 border rounded ${
              selectedMonths.includes(data.month)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
            onClick={() => handleMonthSelection(data.month)}
          >
            {data.month}
          </button>
        ))}
      </div>

      <PDFViewer style={{ width: "100%", height: "100vh" }}>
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Image style={styles.logo} src={occupiLogo} />
              <Text style={styles.title}>Occupi Report</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.paragraph}>{summaryText}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.paragraph}>
                Monthly Office Occupancy Table
              </Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Month</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Occupancy (%)</Text>
                  </View>
                </View>
                {filteredOccupancyData.map((data) => (
                  <View style={styles.tableRow} key={data.month}>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{data.month}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{data.occupancy}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

           {/* Updated Additional data section */}
           <View style={styles.section}>
              <Text style={styles.paragraph}>Additional Details</Text>
              <View style={styles.table}>
                {additionalData.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{item.category}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* AI Predicted Capacity */}
            <View style={styles.section}>
              <Text style={styles.paragraph}>AI Predicted Capacity for the Week</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Date</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Day</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Predicted Attendance</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Weekend</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Special Event</Text>
                  </View>
                </View>
                {capacityData.map((data) => (
                  <View style={styles.tableRow} key={data.date}>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{data.date}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{data.day}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{data.predicted}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{data.isWeekend ? "Yes" : "No"}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{data.specialEvent ? "Yes" : "No"}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Visualization */}
            

            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
              fixed
            />
          </Page>

          {/* Second Page */}
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Image style={styles.logo} src={occupiLogo} />
              <Text style={styles.title}>Occupi Report - Summary</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.paragraph}>
                This page provides a summary of the occupancy trends observed
                over the past six months. It highlights the overall increase in
                office utilization and recommends strategies to optimize
                workspace efficiency.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.paragraph}>
                Weekly Attendance Analysis
              </Text>
              <Text style={styles.paragraph}>
                Based on the AI predictions, here's a summary of the upcoming week:
              </Text>
              <Text style={styles.paragraph}>
                - Highest predicted attendance: {Math.max(...capacityData.map(d => parseInt(d.predicted.split('-')[1])))} (on {capacityData.find(d => d.predicted === Math.max(...capacityData.map(d => parseInt(d.predicted.split('-')[1]))).toString())?.day})
              </Text>
              <Text style={styles.paragraph}>
                - Lowest predicted attendance: {Math.min(...capacityData.map(d => parseInt(d.predicted.split('-')[0])))} (on {capacityData.find(d => d.predicted === Math.min(...capacityData.map(d => parseInt(d.predicted.split('-')[0]))).toString())?.day})
              </Text>
              <Text style={styles.paragraph}>
                - Number of weekend days: {capacityData.filter(d => d.isWeekend).length}
              </Text>
              <Text style={styles.paragraph}>
                - Special events this week: {capacityData.filter(d => d.specialEvent).length}
              </Text>
            </View>

            {/* Recommendations */}
            <View style={styles.section}>
              <Text style={styles.paragraph}>Recommendations</Text>
              <Text style={styles.paragraph}>
                - Adjust office hours to align with peak occupancy times.
                - Re-evaluate the use of meeting rooms and common areas to
                maximize efficiency.
                - Consider flexible work policies to balance occupancy across different days.
              </Text>
            </View>

            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
              fixed
            />
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}

export default BasicDocument;




