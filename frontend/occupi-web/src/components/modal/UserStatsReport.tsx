import { useEffect, useState } from 'react';
import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Input, Button } from '@nextui-org/react';
import * as userStatsService from 'userStatsService';
import { UserStats } from './UserStatsTypes';
import { occupiLogo } from '@assets/index';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '2 solid black',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
  },
  noData: {
    fontSize: 12,
    color: 'red',
  },
});

const UserStatsReport = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setStats] = useState<UserStats | null>(null);
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-09-11');
  
  const [filteredStats, setFilteredStats] = useState<UserStats | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const params = { email, timeFrom: `${startDate}T00:00:00.000Z`, timeTo: `${endDate}T00:00:00.000Z` };

    try {
      const [userHours, userWorkRatio, userArrivalDepartureAverage, userPeakOfficeHours] = await Promise.all([
        userStatsService.getUserHours(params),
        userStatsService.getUserWorkRatio(params),
        userStatsService.getUserArrivalDepartureAverage(params),
        userStatsService.getUserPeakOfficeHours(params),
      ]);

      const newStats: UserStats = {
        dailyHours: userHours.data,
        workRatio: {
          ...userWorkRatio.data[0],
          days: userWorkRatio.data[0].days.map(day => ({
            ...day,
            ratio: day.ratio ?? 0,
            hours: day.hours ?? [],
            avgArrival: day.avgArrival ?? '',
            avgDeparture: day.avgDeparture ?? '',
          })),
        },
        arrivalDeparture: {
          ...userArrivalDepartureAverage.data[0],
          days: userArrivalDepartureAverage.data[0].days.map(day => ({
            ...day,
            ratio: 0,
            hours: [],
          })),
        },
        peakHours: {
          ...userPeakOfficeHours.data[0],
          days: userPeakOfficeHours.data[0].days.map(day => ({
            ...day,
            hours: day.hours.map(hour => parseFloat(hour)),
            ratio: day.ratio ?? 0,
            avgArrival: day.avgArrival ?? '',
            avgDeparture: day.avgDeparture ?? '',
          })),
        },
      };

      setStats(newStats);
      setFilteredStats(newStats);
    } catch (err) {
      setError('Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [email, startDate, endDate]);

  const generatePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={occupiLogo} />
          <Text style={styles.title}>Occupi User Statistics Report</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          {filteredStats ? (
            <>
              <Text style={styles.paragraph}>Average Daily Hours: {filteredStats.workRatio.ratio.toFixed(2)}</Text>
              <Text style={styles.paragraph}>Work Ratio: {filteredStats.workRatio.ratio.toFixed(2)}</Text>
              <Text style={styles.paragraph}>
                Average Arrival Time: {filteredStats.arrivalDeparture.overallavgArrival}
              </Text>
              <Text style={styles.paragraph}>
                Average Departure Time: {filteredStats.arrivalDeparture.overallavgDeparture}
              </Text>
            </>
          ) : (
            <Text style={styles.noData}>No data available for this date range.</Text>
          )}
        </View>

        {/* Daily Hours Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Hours</Text>
          {filteredStats && filteredStats.dailyHours.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Date</Text>
                <Text style={styles.tableCell}>Total Hours</Text>
              </View>
              {filteredStats.dailyHours.map(day => (
                <View key={day.date} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{day.date}</Text>
                  <Text style={styles.tableCell}>{day.totalHours}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>No daily hours data for this date range.</Text>
          )}
        </View>

        {/* Peak Office Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peak Office Hours</Text>
          {filteredStats && filteredStats.peakHours.days.length > 0 ? (
            filteredStats.peakHours.days.map(day => (
              <Text key={day.weekday} style={styles.paragraph}>
                {day.weekday}: {day.hours.join(', ')}
              </Text>
            ))
          ) : (
            <Text style={styles.noData}>No peak hours data for this date range.</Text>
          )}
        </View>

        {/* Arrival and Departure Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arrival and Departure Times</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Day</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Average Arrival</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Average Departure</Text>
            </View>
            {filteredStats && filteredStats.arrivalDeparture.days.length > 0 ? (
              filteredStats.arrivalDeparture.days.map(day => (
                <View key={day.weekday} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{day.weekday}</Text>
                  <Text style={styles.tableCell}>{day.avgArrival}</Text>
                  <Text style={styles.tableCell}>{day.avgDeparture}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noData}>No arrival and departure data for this date range.</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex flex-col gap-4">
        <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <Button onClick={fetchStats}>Apply Date Range</Button>
      </div>

      <PDFViewer width="100%" height="600">
        {generatePDF()}
      </PDFViewer>
    </div>
  );
};

export default UserStatsReport;
