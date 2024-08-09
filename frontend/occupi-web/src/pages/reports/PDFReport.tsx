import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";
import { TopNav } from "@components/index";
import { occupiLogo } from "@assets/index";
import axios from "axios";

// Define the interface for the data
interface CapacityData {
  day: string;
  predicted: number;
}
interface ResponseItem {
  Day_of_Week: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
}

// Sample data
const occupancyData = [
  { month: "January", occupancy: 60 },
  { month: "February", occupancy: 70 },
  { month: "March", occupancy: 75 },
  { month: "April", occupancy: 80 },
  { month: "May", occupancy: 85 },
  { month: "June", occupancy: 90 },
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
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
  },
  tableCol: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
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
});

// Mock summary data
const summaryText = `The report analyzes monthly office occupancy trends from January to June. The data indicates a steady increase in occupancy, reaching its peak in June. Recommendations include optimizing office space usage and considering flexible working options to manage increasing demand.`;

// Mock additional data for the report
const additionalData = [
  { category: "Total Floors", value: 5 },
  { category: "Total Meeting Rooms", value: 12 },
  { category: "Average Desk Utilization", value: "75%" },
];

// Create Document Component
function BasicDocument() {
  const [searchQuery, setSearchQuery] = useState("");
  const [capacityComparisonData, setCapacityComparisonData] = useState<CapacityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleInputChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setSearchQuery(e.target.value);
  };

  const convertRangeToNumber = (range: string) => {
    if (!range) return 0; // Return a default value if range is undefined
    const [min, max] = range.split("-").map(Number);
    return (min + max) / 2;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ResponseItem[]>(
          "https://ai.occupi.tech/predict_week"
        );
        const formattedData = response.data.map((item: ResponseItem) => ({
          day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][item.Day_of_Week],
          predicted: convertRangeToNumber(item.Predicted_Attendance_Level),
        }));
        setCapacityComparisonData(formattedData);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              <Text style={styles.paragraph}>Monthly Office Occupancy Table</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text>Month</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>Occupancy (%)</Text>
                  </View>
                </View>
                {occupancyData.map((data) => (
                  <View style={styles.tableRow} key={data.month}>
                    <View style={styles.tableCol}>
                      <Text>{data.month}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{data.occupancy}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Additional data section */}
            <View style={styles.section}>
              <Text style={styles.paragraph}>Additional Details</Text>
              <View style={styles.table}>
                {additionalData.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <View style={styles.tableCol}>
                      <Text>{item.category}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Capacity Comparison Data */}
            <View style={styles.section}>
              <Text style={styles.paragraph}>AI Predicted Capacity</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text>Day</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>Predicted Capacity</Text>
                  </View>
                </View>
                {capacityComparisonData.map((data) => (
                  <View style={styles.tableRow} key={data.day}>
                    <View style={styles.tableCol}>
                      <Text>{data.day}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{data.predicted}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

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