import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { WaveIndicator } from 'react-native-indicators';
import { useNavigation } from '@react-navigation/native';
import { Skeleton } from 'moti/skeleton';
import { ActivityIndicator } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import AnalyticsGraph from '@/components/AnalyticsGraph';
import { Text, View, Icon } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';
import { getAnalytics } from '@/services/analyticsservices';
import { convertAvgArrival, convertAvgDeparture, convertData, fetchUserArrivalAndDeparture, fetchUserArrivalAndDepartureArray, fetchUserAverageHours, fetchUserInOfficeRate, fetchUserPeakHours, fetchUserTotalHours, fetchUserTotalHoursArray, fetchWorkRatio } from '@/utils/analytics';
import ComparativelineGraph from '@/components/ComparativeLineGraph';
import PieGraph from '@/components/PieGraph';

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
  const [totalGraph, setTotalGraph] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [timeGraph, setTimeGraph] = useState(false);
  const [activeGraph, setActiveGraph] = useState("");
  const [graphArrivalData, setGraphArrivalData] = useState(null);
  const [graphDepartureData, setGraphDepartureData] = useState(null);

  const backgroundColor = isDarkMode ? 'black' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#101010' : '#F3F3F3';

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
  }

  const fetchUserAnalytics = async (timefrom : string, timeto: string) => {

    // console.log(timeTo);
    setIsLoading(true);
    try {
      const hours = await fetchUserTotalHours(timefrom, timeto);
      // console.log('hours', hours);
      const average = await fetchUserAverageHours(timefrom, timeto);
      const ratio = await fetchWorkRatio(timefrom, timeto);
      // const peak = await fetchUserPeakHours(timeFrom, timeTo);
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
      setWorkRatio(ratio);
      // setPeakHours(peak);
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
    fetchUserAnalytics("","");
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

  const scrollCards = [
    { title: 'Daily Progress', color: '#E0FA88', border: '#C6F432' },
    { title: 'Average Hours', color: '#C09FF8', border: '#843BFF' },
    { title: 'Work Ratio', color: '#FEC4DD', border: '#FF99C5' },
    { title: 'In-Office Rate', color: '#FF896E', border: '#F45632' },
    { title: 'Task Completion', color: '#90EE90', border: '#32CD32' },
    { title: 'Collaboration Score', color: '#FFD700', border: '#FFA500' },
  ];

  const analyticsCards = [
    { title: `Total Hours: `, value: convertToHoursAndMinutes(userHours), color: '#101010', border: accentColour },
    { title: 'Office Hours', value: convertToHoursAndMinutes(userAverage), color: '#101010', border: accentColour },
    { title: 'Work Ratio', value: convertToHoursAndMinutes(workRatio), color: '#101010', border: accentColour },
    { title: 'Peak Office Hours', value: convertToHoursAndMinutes(peakHours), color: '#101010', border: accentColour },
    { title: 'Arrival and Departure', value: convertToHoursAndMinutes(userHours), color: '#101010', border: accentColour },
    { title: 'In Office Rate', value: convertToHoursAndMinutes(inOfficeRate), color: '#101010', border: accentColour },
  ];

  return (
    <View style={{
      flex: 1,
      borderRadius: wp('5%'),
      paddingVertical: wp('5%'),
      paddingHorizontal: wp('3%'),
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
    }}>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: hp('5%'),
          left: wp('5%'),
          zIndex: 1,
        }}
        onPress={() => router.replace('home')}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={isDarkMode ? 'white' : 'black'}
          style={{
            padding: wp('3%'),
            borderRadius: wp('4%'),
            marginBottom: hp('3%'),
          }}
        />
      </TouchableOpacity>

      <Text style={{
        fontSize: wp('6%'),
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
        marginTop: hp('8%'),
        marginBottom: hp('1%'),
      }}>OccuBot - AI Analyser</Text>

      <Text style={{
        fontSize: wp('4%'),
        color: isDarkMode ? '#888' : '#555',
        marginBottom: hp('2%'),
      }}>Comprehensive Office Analytics</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: isDarkMode ? '#333' : '#E1E1E1',
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: isDarkMode ? '#555' : '#979595',
          borderWidth: 2,
        }}>
          <Text style={{
            fontSize: wp('4.5%'),
            fontWeight: 'bold',
            color: isDarkMode ? 'white' : 'black',
            marginBottom: hp('1%'),
          }}>Your Performance Summary</Text>
          <Text style={{
            color: isDarkMode ? '#CCC' : '#333',
            fontSize: wp('3.5%'),
          }}>{summary}</Text>
        </View>

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
              <Text style={{
                fontSize: wp('5%'),
                fontWeight: 'bold',
                color: textColor,
              }}>Average Hours Per Day: </Text>
              {!isLoading ? (
                <Text color={textColor}>{userHours === -1 ? "No data for selected period" : convertToHoursAndMinutes(userAverage)}</Text>
              ) : (
                <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
              )}
            </View>
            {userHours !== -1 && <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />}
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
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <View>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: textColor,
            }}>Work Ratio: </Text>
            {!isLoading ? (
              <Text color={textColor}>{convertToHoursAndMinutes(workRatio)}</Text>
            ) : (
              <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
            )}
          </View>
          <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />
        </View>
        <View style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: accentColour,
          borderWidth: 2,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <View>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: textColor,
            }}>Peak Hours:</Text>
            {!isLoading ? (
              <Text color={textColor}>{convertToHoursAndMinutes(peakHours)}</Text>
            ) : (
              <Text color={textColor}>No peak hours found</Text>
            )}
          </View>
          <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />
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
                  <Text color={textColor}>Average Arrival Time: <Text bold color={textColor}>{arrival}</Text></Text>
                  <Text color={textColor}>Average Departure Time: <Text bold color={textColor}>{departure}</Text></Text>
                </>
              ) : (
                <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={40} width={"80%"} />
              )}
            </View>
            {userHours !== -1 && <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />}
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
            {userHours !== -1 && <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />}
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

        {/* <Text style={{
          fontSize: wp('4%'),
          color: isDarkMode ? '#888' : '#555',
          marginBottom: hp('2%'),
        }}>Workplace Optimization</Text>

        <View style={{
          backgroundColor: '#9CF0E2',
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: '#1EE9C8',
          borderWidth: 2,
        }}>
          <Text style={{
            fontSize: wp('5%'),
            fontWeight: 'bold',
            color: 'white',
            marginBottom: hp('2%'),
          }}>Meeting Room Utilization</Text>
        </View>

        <View style={{
          backgroundColor: '#FFB6C1',
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: '#FF69B4',
          borderWidth: 2,
        }}>
          <Text style={{
            fontSize: wp('5%'),
            fontWeight: 'bold',
            color: 'white',
            marginBottom: hp('2%'),
          }}>Workspace Efficiency</Text>
        </View> */}
      </ScrollView>
    </View>
  );
};

export default Stats;