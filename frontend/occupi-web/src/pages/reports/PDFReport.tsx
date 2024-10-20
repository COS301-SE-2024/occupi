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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
    paddingBottom: 5,
    borderBottom: "1 solid #CCCCCC",
  },
  section: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#FAFAFA",
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
  bulletPoint: {
    marginLeft: 10,
    fontSize: 12,
  },
});

const summaryText = `This report provides an in-depth analysis of the office occupancy trends over highlighting key areas for improvement and optimization based on AI-driven predictions.`;

function BasicDocument() {
  const [searchQuery, setSearchQuery] = useState("");
  const [capacityData, setCapacityData] = useState<CapacityData[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
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

        const totalFloors = new Set(roomsData.map((room: { floorNo: number; }) => room.floorNo)).size;
        const totalMeetingRooms = roomsData.length;
        const totalOccupancy = bookingsData.reduce((sum: number, booking: { count: number; }) => sum + booking.count, 0);
        const totalCapacity = roomsData.reduce((sum: number, room: { maxOccupancy: number; }) => sum + (room.maxOccupancy || 0), 0);
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

  useEffect(() => {
    const fetchCapacityData = async () => {
      try {
        const response = await axios.get<ResponseItem[]>("https://ai.occupi.tech/predict_week");
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

    fetchCapacityData();
  }, []);

  const handleInputChange = (e: { target: { value: React.SetStateAction<string> }}) => {
    setSearchQuery(e.target.value);
  };

  const handleMonthSelection = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const filteredOccupancyData = occupancyData.filter(data =>
    selectedMonths.includes(data.month)
  );

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Reports
            <span className="block text-sm opacity-65 text-text_col_secondary_alt">
              Generate and download reports for Analysis
            </span>
          </div>
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />

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
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              <Text style={styles.paragraph}>{summaryText}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facility Overview</Text>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Monthly Occupancy Analysis</Text>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Capacity Forecast</Text>
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

            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
              fixed
            />
          </Page>

          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Image style={styles.logo} src={occupiLogo} />
              <Text style={styles.title}>Occupi Report - Analysis</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Attendance Insights</Text>
              <Text style={styles.paragraph}>
                Based on AI predictions, here are the key metrics for the upcoming week:
              </Text>
              <Text style={styles.bulletPoint}>
                • Peak Attendance: {Math.max(...capacityData.map(d => parseInt(d.predicted.split('-')[1])))}% 
                ({capacityData.find(d => d.predicted === Math.max(...capacityData.map(d => parseInt(d.predicted.split('-')[1]))).toString())?.day})
              </Text>
              <Text style={styles.bulletPoint}>
                • Lowest Attendance: {Math.min(...capacityData.map(d => parseInt(d.predicted.split('-')[0])))}%
                ({capacityData.find(d => d.predicted === Math.min(...capacityData.map(d => parseInt(d.predicted.split('-')[0]))).toString())?.day})
              </Text>
              <Text style={styles.bulletPoint}>
                • Weekend Days: {capacityData.filter(d => d.isWeekend).length}
              </Text>
              <Text style={styles.bulletPoint}>
                • Special Events: {capacityData.filter(d => d.specialEvent).length}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              <Text style={styles.bulletPoint}>
                • Optimize office hours based on peak occupancy patterns
              </Text>
              <Text style={styles.bulletPoint}>
                • Restructure meeting room allocation for maximum efficiency
              </Text>
              <Text style={styles.bulletPoint}>
                • Implement flexible work policies to balance daily occupancy
              </Text>
            </View>

            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
              fixed
            />
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}

export default BasicDocument;