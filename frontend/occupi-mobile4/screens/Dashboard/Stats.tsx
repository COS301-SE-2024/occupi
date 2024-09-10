import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { WaveIndicator } from 'react-native-indicators';
import { useNavigation } from '@react-navigation/native';
import { Skeleton } from 'moti/skeleton';
import { ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AnalyticsGraph from '@/components/AnalyticsGraph';
import { Text, View, Icon } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';
import { getAnalytics } from '@/services/analyticsservices';
import { convertData, fetchUserArrivalAndDeparture, fetchUserAverageHours, fetchUserInOfficeRate, fetchUserPeakHours, fetchUserTotalHours, fetchUserTotalHoursArray, fetchWorkRatio } from '@/utils/analytics';

const Stats = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const [isDarkMode, setIsDarkMode] = useState(currentTheme === 'dark');
  const [accentColour, setAccentColour] = useState<string>('greenyellow');
  const [summary, setSummary] = useState('');
  const [userHours, setUserHours] = useState<number>();
  const [userAverage, setUserAverage] = useState<number>();
  const [workRatio, setWorkRatio] = useState<number>();
  const [peakHours, setPeakHours] = useState([]);
  const [arrival, setArrival] = useState<number>();
  const [departure, setDeparture] = useState<number>();
  const [inOfficeRate, setInOfficeRate] = useState<number>();
  const [timeFrom, setTimeFrom] = useState("1970-01-01T00:00:00.000Z");
  const [timeTo, setTimeTo] = useState("2024-06-01T00:00:00.000Z");
  const [totalGraph, setTotalGraph] = useState(false);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    resetTimeFrames();
    fetchUserAnalytics();
  }, []);

  const convertToHoursAndMinutes = (totalHours: number): string => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours} hours and ${minutes} minutes`;
  };

  const fetchData = async (data: string) => {
    if (totalGraph === true) {
      setGraphData(null);
      setTotalGraph(false);
      resetTimeFrames();
    } else {
      setTotalGraph(true);
      console.log(timeFrom, timeTo);
      const total = await fetchUserTotalHoursArray(timeFrom, timeTo);
      setGraphData(convertData(total));
    }
  }

  const fetchUserAnalytics = async () => {
    // console.log(timeTo);
    try {
      const hours = await fetchUserTotalHours(timeFrom, timeTo);
      const average = await fetchUserAverageHours(timeFrom, timeTo);
      const ratio = await fetchWorkRatio(timeFrom, timeTo);
      // const peak = await fetchUserPeakHours(timeFrom, timeTo);
      const arrivalDeparture = await fetchUserArrivalAndDeparture(timeFrom, timeTo);
      const inOffice = await fetchUserInOfficeRate(timeFrom, timeTo);
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
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    }
  };

  const resetTimeFrames = () => {
    const timeFrom = "1970-01-01T00:00:00.000Z";
    const timeTo = new Date().toISOString();
    // console.log(timeTo);
    setTimeFrom(timeFrom);
    setTimeTo(timeTo);
  }

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };
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
      padding: wp('5%'),
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
          marginBottom: hp('2%'),
        }}>Detailed Analytics</Text>

        <View style={{
          backgroundColor: '#101010',
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          borderColor: accentColour,
          borderWidth: 2,
          justifyContent: 'space-between'
        }}
        >
          <TouchableOpacity onPress={() => fetchData('total')} style={{ flexDirection: 'row', justifyContent: 'space-between' }} justifyContent='space-between'>
            <View>
              <Text style={{
                fontSize: wp('5%'),
                fontWeight: 'bold',
                color: 'white',
              }}>Total Hours: </Text>
              {userHours ? (
                <Text color='white'>{convertToHoursAndMinutes(userHours)}</Text>
              ) : (
                <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
              )}
            </View>
            <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
          <View>
            {totalGraph === true &&
              <>
                {graphData !== null ? (
                  <AnalyticsGraph data={graphData} />
                ) : (
                  <WaveIndicator color={accentColour} />
                )
                }
              </>
            }
          </View>

        </View>
        <View style={{
          backgroundColor: '#101010',
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
              color: 'white',
            }}>Average Office Hours: </Text>
            {userAverage ? (
              <Text color='white'>{convertToHoursAndMinutes(userAverage)}</Text>
            ) : (
              <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
            )}
          </View>
          <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />
        </View>
        <View style={{
          backgroundColor: '#101010',
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
              color: 'white',
            }}>Work Ratio: </Text>
            {workRatio ? (
              <Text color='white'>{convertToHoursAndMinutes(workRatio)}</Text>
            ) : (
              <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={20} width={"80%"} />
            )}
          </View>
          <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />
        </View>
        <View style={{
          backgroundColor: '#101010',
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
              color: 'white',
            }}>Peak Hours:</Text>
            {peakHours ? (
              <Text color='white'>{convertToHoursAndMinutes(peakHours)}</Text>
            ) : (
              <Text color='white'>No peak hours found</Text>
            )}
          </View>
          <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />
        </View>
        <View style={{
          backgroundColor: '#101010',
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
              color: 'white',
            }}>Arrival and Departure: </Text>
            {arrival ? (
              <>
                <Text color='white'>Arrival: {arrival}</Text>
                <Text color='white'>Departure: {departure}</Text>
              </>
            ) : (
              <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={40} width={"80%"} />
            )}
          </View>
          <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />
        </View>
        <View style={{
          backgroundColor: '#101010',
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
              color: 'white',
            }}>In Office Rate: </Text>
            {inOfficeRate ? (
              <Text color='white'>{Math.floor(inOfficeRate)}%</Text>
            ) : (
              <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={40} width={"80%"} />
            )}
          </View>
          <Icon as={Feather} name="chevron-down" size="40" color={currentTheme === 'dark' ? 'white' : 'black'} />
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