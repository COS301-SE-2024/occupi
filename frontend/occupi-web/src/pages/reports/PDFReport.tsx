import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
    Image,
    Svg,
    G,
    Rect,
    Line
  } from "@react-pdf/renderer";
  import { occupiLogo } from "@assets/index";
  import {
    TabComponent,
  } from "@components/index";
  import { TopNav } from "@components/index";
import { useState, useEffect } from "react";
  
  // Create styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#E4E4E4',
      padding: 30,
    },
    header: {
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottom: '2 solid black',
      marginBottom: 30,
    },
    logo: {
      width: 50,
      height: 50,
    },
    title: {
      fontSize: 24,
      textAlign: 'right',
      textTransform: 'uppercase',
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    viewer: {
      width: '100vw',
      height: '100vh',
    },
    pageNumber: {
      position: 'absolute',
      fontSize: 12,
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'grey',
    },
    paragraph: {
      margin: 10,
      fontSize: 14,
      textAlign: 'justify',
    },
    table: {
      display: 'flex',
      width: 'auto',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    tableCell: { margin: 'auto', marginTop: 5, fontSize: 10 },
  });
  
  // Sample data
  const occupancyData = [
    { month: 'January', occupancy: 60 },
    { month: 'February', occupancy: 70 },
    { month: 'March', occupancy: 75 },
    { month: 'April', occupancy: 80 },
    { month: 'May', occupancy: 85 },
    { month: 'June', occupancy: 90 },
  ];
  
  // Create Document Component
  function BasicDocument() {
    const [searchQuery, setSearchQuery] = useState("");
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    return (
      <div className="w-full overflow-auto">
      <TopNav
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      
      <PDFViewer style={styles.viewer}>
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Image
                style={styles.logo}
                src={occupiLogo}
              />
              <Text style={styles.title}>Occupi Report</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.paragraph}>Monthly Office Occupancy</Text>
              <Svg height="250" width="100%">
                {/* X and Y Axes */}
                <Line x1="50" y1="20" x2="50" y2="200" stroke="black" />
                <Line x1="50" y1="200" x2="380" y2="200" stroke="black" />
                {/* X Axis Labels */}
                {occupancyData.map((data, index) => (
                  <Text key={data.month} x={50 + index * 40 + 10} y={215} style={{ fontSize: 10 }}>
                    {data.month.substring(0, 3)}
                  </Text>
                ))}
                {/* Y Axis Labels */}
                {[0, 20, 40, 60, 80, 100].map((value) => (
                  <Text key={value} x="30" y={200 - value * 2}>
                    {value}
                  </Text>
                ))}
                {/* Bars */}
                <G fill="#00f">
                  {occupancyData.map((data, index) => (
                    <Rect
                      key={data.month}
                      x={50 + index * 40 + 5}
                      y={200 - data.occupancy * 2}
                      width="30"
                      height={data.occupancy * 2}
                    />
                  ))}
                </G>
              </Svg>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Month</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Occupancy (%)</Text>
                  </View>
                </View>
                {occupancyData.map((data) => (
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
              <Text style={styles.paragraph}>
                The above data shows the monthly office occupancy. The trend indicates an increase in occupancy from January to June. It is recommended to monitor this trend closely and consider optimizing office space usage to accommodate the increasing occupancy. Implementing flexible working hours or remote work options could also help manage the office space more efficiently.
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
  