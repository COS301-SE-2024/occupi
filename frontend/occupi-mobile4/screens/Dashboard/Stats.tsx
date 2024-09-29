import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { WaveIndicator } from 'react-native-indicators';
import { useNavigation } from '@react-navigation/native';
import { Skeleton } from 'moti/skeleton';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import AnalyticsGraph from '@/components/AnalyticsGraph';
import { Text, View, Icon } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';
import { convertAvgArrival, convertAvgDeparture, convertData, fetchUserArrivalAndDeparture, fetchUserArrivalAndDepartureArray, fetchUserAverageHours, fetchUserInOfficeRate, fetchUserPeakHours, fetchUserTotalHours, fetchUserTotalHoursArray, fetchWorkRatio, getAllPeakHours } from '@/utils/analytics';
import ComparativelineGraph from '@/components/ComparativeLineGraph';
import PieGraph from '@/components/PieGraph';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import Tooltip from '@/components/Tooltip';

const Stats = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const [isDarkMode, setIsDarkMode] = useState(currentTheme === 'dark');
  const [accentColour, setAccentColour] = useState<string>('greenyellow');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [userHours, setUserHours] = useState<number>();
  const [userAverage, setUserAverage] = useState<number>();
  const [isDatePicker1Visible, setDatePicker1Visibility] = useState(false);
  const [isDatePicker2Visible, setDatePicker2Visibility] = useState(false);
  const [workRatio, setWorkRatio] = useState<number>();
  const [peakHours, setPeakHours] = useState([]);
  const [arrival, setArrival] = useState<number>();
  const [departure, setDeparture] = useState<number>();
  const [inOfficeRate, setInOfficeRate] = useState<number>();
  const [timeFrom, setTimeFrom] = useState<string>("");
  const [timeTo, setTimeTo] = useState<string>("");
  const [peakHoursAll, setPeakHoursAll] = useState([]);
  const [totalGraph, setTotalGraph] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [timeGraph, setTimeGraph] = useState(false);
  const [activeGraph, setActiveGraph] = useState("");
  const [graphArrivalData, setGraphArrivalData] = useState(null);
  const [graphDepartureData, setGraphDepartureData] = useState(null);

  const backgroundColor = isDarkMode ? 'black' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#101010' : '#F3F3F3';

  const suffixes = ['1', '2', '3'];

  const convertToHoursAndMinutes = (totalHours: number): string => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours} hours and ${minutes} minutes`;
  };

  const fetchData = async (data: string) => {
    // console.log(data);
    if (data === "hours") {
      if (userHours === -1) {
        return;
      }
      else if (activeGraph !== "") {
        setGraphData(null);
        setActiveGraph("");
        // resetTimeFrames();
      } else {
        setActiveGraph("hours");
        // console.log(timeFrom, timeTo);
        const total = await fetchUserTotalHoursArray(timeFrom, timeTo);
        setGraphData(convertData(total));
      }
    } else if (data === "times") {
      if (userHours === -1) {
        return;
      }
      else if (activeGraph !== "") {
        setGraphData(null);
        setActiveGraph("");
        // resetTimeFrames();
      } else {
        setActiveGraph("times");
        // console.log(timeFrom, timeTo);
        const total = await fetchUserArrivalAndDepartureArray(timeFrom, timeTo);
        // console.log(convertAvgArrival(total));
        setGraphArrivalData(convertAvgArrival(total));
        setGraphDepartureData(convertAvgDeparture(total));
      }
    } else if (data === "rate") {
      if (userHours === -1) {
        return;
      }
      else if (activeGraph !== "") {
        setGraphData(null);
        setActiveGraph("");
        // resetTimeFrames();
      } else {
        setGraphData(inOfficeRate);
        setActiveGraph("rate");
        // console.log(timeFrom, timeTo);
      }
    }
    else if (data === "peak") {
      if (userHours === -1) {
        return;
      }
      else if (activeGraph !== "") {
        setGraphData(null);
        setActiveGraph("");
        // resetTimeFrames();
      } else {
        setActiveGraph("peak");
        // console.log(timeFrom, timeTo);
        const data = await getAllPeakHours(timeFrom, timeTo);
        console.log(data);
        setPeakHoursAll(data);
      }
    }
  }

  const printToFile = async () => {
    if (userHours === -1) {
      Alert.alert("No data for the selected time frame.");
      return;
    }
    const html = `
        <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
              <title>User Office Metrics Report</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      color: #333;
                      max-width: 800px;
                      margin: 0 auto;
                      padding: 20px;
                  }
                  img {
                      display: block;
                      margin: 0 auto;
                  }
                  h1 {
                      color: #2c3e50;
                      text-align: center;
                      border-bottom: 2px solid #3498db;
                      padding-bottom: 10px;
                  }
                  span {
                    font-weight: bold;
                  }
                  .report-period {
                      text-align: center;
                      font-style: italic;
                      margin-bottom: 20px;
                  }
                  .metrics-grid {
                      display: grid;
                      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                      gap: 20px;
                      margin-top: 30px;
                  }
                  .metric-card {
                      background-color: #f9f9f9;
                      border-radius: 8px;
                      padding: 15px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  .metric-title {
                      font-weight: bold;
                      color: #2980b9;
                      margin-bottom: 10px;
                  }
                  .metric-value {
                      font-size: 1.2em;
                      color: #27ae60;
                  }
                  @media print {
                      body {
                          print-color-adjust: exact;
                          -webkit-print-color-adjust: exact;
                      }
                  }
              </style>
          </head>
          <body>
              <img
              src="https://raw.githubusercontent.com/COS301-SE-2024/occupi/5614db6d7821bb21b94125c83bc5a46126c5acac/frontend/occupi-web/public/occupi.svg"
              style="width: 30vw; padding: 2vw;" />
              <h1>User Office Metrics Report</h1>
              <div class="report-period">
                  Report Period: <span id="startDate">${timeFrom === "" ? "Start of Work Period" : extractDateFromDate(timeFrom)}</span> to <span id="endDate">${timeTo === "" ? "Today" : extractDateFromDate(timeTo)}</span>
              </div>
              <div class="metrics-grid">
                  <div class="metric-card">
                      <div class="metric-title">Total Hours in Office</div>
                      <div class="metric-value" id="totalHours">${convertToHoursAndMinutes(userHours)}</div>
                  </div>
                  <div class="metric-card">
                      <div class="metric-title">Average Hours per Day</div>
                      <div class="metric-value" id="avgHoursPerDay">${convertToHoursAndMinutes(userAverage)}</div>
                  </div>
                  <div class="metric-card">
                      <div class="metric-title">Work Ratio</div>
                      <div class="metric-value" id="workRatio">${Math.floor(workRatio)}</div>
                  </div>
                  <div class="metric-card">
                      <div class="metric-title">Peak Hours</div>
                      <div class="metric-value" id="peakHours">N/A</div>
                  </div>
                  <div class="metric-card">
                      <div class="metric-title">Average Arrival Time</div>
                      <div class="metric-value" id="avgArrivalTime">${arrival}</div>
                  </div>
                  <div class="metric-card">
                      <div class="metric-title">Average Departure Time</div>
                      <div class="metric-value" id="avgDepartureTime">${departure}</div>
                  </div>
                  <div class="metric-card">
                      <div class="metric-title">In-Office Rate</div>
                      <div class="metric-value" id="inOfficeRate">${Math.floor(inOfficeRate)}%</div>
                  </div>
              </div>
              <script>
                  // You can use JavaScript to populate the values dynamically
                  // For example:
                  // document.getElementById('totalHours').textContent = userMetrics.totalHours;
                  // Repeat for other metrics and date range
              </script>
          </body>
          </html>
        `;
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const { uri } = await Print.printToFileAsync({ html });
    console.log('File has been saved to:', uri);
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  const fetchUserAnalytics = async (timefrom: string, timeto: string) => {

    // console.log(timeTo);
    setIsLoading(true);
    try {
      const hours = await fetchUserTotalHours(timefrom, timeto);
      console.log('hours', hours);
      const average = await fetchUserAverageHours(timefrom, timeto);
      // const ratio = await fetchWorkRatio(timefrom, timeto);
      const peak = await fetchUserPeakHours(timefrom, timeto);
      const arrivalDeparture = await fetchUserArrivalAndDeparture(timefrom, timeto);
      const inOffice = await fetchUserInOfficeRate(timefrom, timeto);
      // console.log('hours', hours);
      // console.log('average', average);
      // console.log('ratio', ratio);
      // console.log('peak', peak);
      // console.log('arrivalDeparture', arrivalDeparture[0]);
      // console.log('inOffice', inOffice);
      setUserHours(hours);
      setUserAverage(average);
      // setWorkRatio(ratio);
      setPeakHours(peak);
      setArrival(arrivalDeparture[0]);
      setDeparture(arrivalDeparture[1]);
      setInOfficeRate(inOffice);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching user analytics:', error);
    }
  };

  useEffect(() => {
    // resetTimeFrames();
    fetchUserAnalytics("", "");
  }, []);

  const hideDatePicker1 = () => {
    setDatePicker1Visibility(false);
  };

  const showDatePicker1 = () => {
    setDatePicker1Visibility(true);
  };

  const hideDatePicker2 = () => {
    setDatePicker2Visibility(false);
  };

  const showDatePicker2 = () => {
    setDatePicker2Visibility(true);
  };

  const handleConfirm1 = async (date: Date) => {
    const selectedDate: string = date.toISOString();
    // console.log('selected', selectedDate);
    setTimeFrom(selectedDate);
    hideDatePicker1();
    setGraphData(null);
    setTotalGraph(false);
    await fetchUserAnalytics(selectedDate, timeTo);
  };

  const handleConfirm2 = async (date: Date) => {
    const selectedDate: string = date.toISOString();
    // console.log('selected', selectedDate);
    setTimeTo(selectedDate);
    hideDatePicker2();
    setGraphData(null);
    setTotalGraph(false);
    await fetchUserAnalytics(timeFrom, selectedDate);
  };

  const resetTimeFrames = () => {
    setTimeFrom("");
    setTimeTo("");
  }

  function extractDateFromDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toDateString();
  }

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };
    setIsDarkMode(currentTheme === 'dark');
    getAccentColour();
  }, []);

  return (
    <View style={{
      flex: 1,
      paddingHorizontal: wp('3%'),
      paddingTop: hp('5%'),
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
    }}>
      <View flexDirection='row' alignItems='center'>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon
            as={Feather}
            name="chevron-left"
            size={40}
            color={currentTheme === 'dark' ? 'white' : 'black'}
          />
        </TouchableOpacity>
        <Text style={{
          fontSize: wp('6%'),
          fontWeight: 'bold',
          paddingLeft: 14,
          color: isDarkMode ? 'white' : 'black'
        }}>OccuBot - AI Analyser</Text>
      </View>
      <Text style={{
        fontSize: wp('4%'),
        color: isDarkMode ? '#888' : '#555',
        marginBottom: hp('2%'),
      }}>Comprehensive Office Analytics</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={printToFile}
          style={{
            backgroundColor: isDarkMode ? '#333' : '#E1E1E1',
            borderRadius: wp('4%'),
            padding: wp('4%'),
            marginBottom: hp('3%'),
            borderColor: isDarkMode ? '#555' : '#979595',
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <Text style={{
            fontSize: wp('4.5%'),
            fontWeight: 'bold',
            color: isDarkMode ? 'white' : 'black',
            // marginBottom: hp('1%'),
          }}>Download Performance Summary</Text>
        </TouchableOpacity>

        <Text style={{
          fontSize: wp('4%'),
          color: isDarkMode ? '#888' : '#555',
          marginBottom: hp('1%'),
        }}>Detailed Analytics</Text>
        <View mb="$2" flexDirection='row' justifyContent='space-around' alignItems='center'>
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: cardBackgroundColor,
              marginTop: 8,
              marginBottom: 8,
              alignItems: 'center'
            }}
            onPress={showDatePicker1}
          >
            <Text color={textColor}>{timeFrom === "" ? "Select Start Date:" : extractDateFromDate(timeFrom)}</Text>
          </TouchableOpacity>
          <Text color={textColor}>to</Text>
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: cardBackgroundColor,
              marginTop: 8,
              marginBottom: 8,
              alignItems: 'center'
            }}
            onPress={showDatePicker2}
          >
            <Text color={textColor}>{timeTo === "" ? "Select End Date:" : extractDateFromDate(timeTo)}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePicker1Visible}
            mode="date"
            date={timeFrom === "" ? new Date() : new Date(timeFrom)}
            // display="calendar"
            onConfirm={handleConfirm1}
            onCancel={hideDatePicker1}
          />
          <DateTimePickerModal
            isVisible={isDatePicker2Visible}
            mode="date"
            date={timeTo === "" ? new Date() : new Date(timeTo)}
            // display="calendar"
            onConfirm={handleConfirm2}
            onCancel={hideDatePicker2}
          />
        </View>
        <View style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: accentColour,
          borderWidth: 2,
          justifyContent: 'space-between'
        }}
        >
          <TouchableOpacity onPress={() => fetchData('total')} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{
                fontSize: wp('5%'),
                fontWeight: 'bold',
                color: textColor,
              }}>Total Hours: </Text>
              {!isLoading ? (
                <Text color={textColor}>{userHours === -1 ? "No data for selected period" : convertToHoursAndMinutes(userHours)}</Text>
              ) : (
                <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: accentColour,
          borderWidth: 2,
          justifyContent: 'space-between'
        }}
        >
          <TouchableOpacity onPress={() => fetchData('hours')} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <View alignItems='center' flexDirection='row'>
                <Text style={{
                  fontSize: wp('5%'),
                  fontWeight: 'bold',
                  color: textColor,
                }}>Average Hours Per Day: </Text>
                <Tooltip
                  content="These values indicate on average, the number of hours you spend in the office in 1 day."
                  placement="bottom"
                />
              </View>
              {!isLoading ? (
                <Text color={textColor}>{userAverage === -1 ? "No data for selected period" : convertToHoursAndMinutes(userAverage)}</Text>
              ) : (
                <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
              )}
            </View>
            {userAverage !== -1 && <Icon as={Feather} name="chevron-down" size="xl" color={currentTheme === 'dark' ? 'white' : 'black'} />}
          </TouchableOpacity>
          <View>
            {activeGraph === 'hours' &&
              <>
                {graphData !== null ? (
                  <AnalyticsGraph
                    data={graphData}
                    title='Hours per day Overtime'
                    x_axis='Day' />
                ) : (
                  <WaveIndicator color={accentColour} />
                )
                }
              </>
            }
          </View>
        </View>
        <View style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: accentColour,
          borderWidth: 2,
          justifyContent: 'space-between'
        }}>
          <TouchableOpacity onPress={() => fetchData('peak')} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{
                fontSize: wp('5%'),
                fontWeight: 'bold',
                color: textColor,
              }}>Peak Hours:</Text>
              {!isLoading ? (
                <Text color={textColor}>{userHours === -1 ? "No data for selected period" : peakHours.weekday + ": " + peakHours.hour + ":00"}</Text>
              ) : (
                <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
              )}
            </View>
            <Icon as={Feather} name="chevron-down" size="xl" color={currentTheme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
          <View>
            {activeGraph === 'peak' &&
              peakHoursAll.map((day) => (
                <View alignItems="center" key={day.weekday}>
                  <Text bold color={textColor}>{day.weekday}:</Text>
                  {day.hours.map((hour, index) => {
                    const suffix = suffixes[index] || `${index + 1}th`;
                    return (
                      <Text color={textColor} fontWeight={'$light'} key={index}>
                        {`  ${suffix}. ${hour}:00`}
                      </Text>
                    );
                  })}
                </View>
              ))
            }
          </View>
        </View>
        <View style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: accentColour,
          borderWidth: 2,
          justifyContent: 'space-between'
        }}>
          <TouchableOpacity onPress={() => fetchData('times')} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{
                fontSize: wp('5%'),
                fontWeight: 'bold',
                color: textColor,
              }}>Arrival and Departure: </Text>
              {!isLoading ? (
                <>
                  <Text color={textColor}>Average Arrival Time: <Text bold color={textColor}>{userHours === -1 ? "No data for selected period" : arrival}</Text></Text>
                  <Text color={textColor}>Average Departure Time: <Text bold color={textColor}>{userHours === -1 ? "No data for selected period" : departure}</Text></Text>
                </>
              ) : (
                <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={40} width={"80%"} />
              )}
            </View>
            {userHours !== -1 && <Icon as={Feather} name="chevron-down" size="xl" color={currentTheme === 'dark' ? 'white' : 'black'} />}
          </TouchableOpacity>
          <View>
            {activeGraph === 'times' &&
              <>
                {graphArrivalData !== null ? (
                  <ComparativelineGraph
                    data={graphArrivalData}
                    data2={graphDepartureData}
                    title='Arrival and Departure Times'
                    x_axis='Day' />
                ) : (
                  <WaveIndicator color={accentColour} />
                )
                }
              </>
            }
          </View>
        </View>
        <View style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: accentColour,
          borderWidth: 2,
          justifyContent: 'space-between'
        }}
        >
          <TouchableOpacity onPress={() => fetchData('rate')} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{
                fontSize: wp('5%'),
                fontWeight: 'bold',
                color: textColor,
              }}>In office Rate: </Text>
              {!isLoading ? (
                <Text color={textColor}>{userHours === -1 ? "No data for selected period" : Math.floor(inOfficeRate)}%</Text>
              ) : (
                <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
              )}
            </View>
            {userHours !== -1 && <Icon as={Feather} name="chevron-down" size="xl" color={currentTheme === 'dark' ? 'white' : 'black'} />}
          </TouchableOpacity>
          <View>
            {activeGraph === 'rate' &&
              <>
                {graphData !== null ? (
                  <PieGraph
                    data={inOfficeRate}
                    title='In Office Rate'
                  />
                ) : (
                  <WaveIndicator color={accentColour} />
                )
                }
              </>
            }
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Stats;