import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, useColorScheme, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Navbar from '../../components/NavBar';
import {
  Text,
  View,
  Image,
  Card,
  Toast,
  useToast,
  ToastTitle,
  Button,
  ButtonText,
  ScrollView,
} from '@gluestack-ui/themed';
// import {
//   LineChart
// } from "react-native-chart-kit";
import * as SecureStore from 'expo-secure-store';
import { FontAwesome6 } from '@expo/vector-icons';
// import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { fetchUsername } from '@/utils/user';
import { Booking } from '@/models/data';
import { fetchUserBookings } from '@/utils/bookings';
import { useTheme } from '@/components/ThemeContext';
import LineGraph from '@/components/LineGraph';
import BarGraph from '@/components/BarGraph';
import { getFormattedDailyPredictionData, getFormattedPredictionData, valueToColor } from '@/utils/occupancy';
import * as Location from 'expo-location';
import { storeCheckInValue } from '@/services/securestore';
import { isPointInPolygon } from '@/utils/dashboard';
import PagerView from 'react-native-pager-view';
import SetDetails from '../Login/SetDetails';

// import { number } from 'zod';

const getRandomNumber = () => {
  return Math.floor(Math.random() * 20) + 300;
};

const Dashboard: React.FC = () => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const [numbers, setNumbers] = useState(Array.from({ length: 15 }, getRandomNumber));
  const [isDarkMode, setIsDarkMode] = useState(currentTheme === 'dark');
  const [checkedIn, setCheckedIn] = useState<boolean>();
  const [roomData, setRoomData] = useState<Booking>({});
  const [username, setUsername] = useState('');
  const [shouldCheckin, setShouldCheckin] = useState(false);
  const toast = useToast();
  const [currentData, setCurrentData] = useState();
  const [currentDayData, setCurrentDayData] = useState();
  const pagerRef = useRef<PagerView>(null);
  const [activeTab, setActiveTab] = useState('Tab1');
  const [weeklyData, setWeeklyData] = useState();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState({ hours: 0, minutes: 0 })
  // console.log(currentTheme);
  // console.log(isDarkMode);

  const mockhourly = [
    { "label": "07:00", "value": 2 },
    { "label": "09:00", "value": 4 },
    { "label": "11:00", "value": 5 },
    { "label": "12:00", "value": 2 },
    { "label": "13:00", "value": 2 },
    { "label": "15:00", "value": 3 },
    { "label": "17:00", "value": 2 }
  ]

  // console.log(currentData);

  const goToNextPage = () => {
    setActiveTab('Tab2');
    // if (pagerRef.current) {
    //   pagerRef.current.setPage(1);
    // }
    setHourly();
  };

  const goToPreviousPage = () => {
    setActiveTab('Tab1');
    setWeekly();
    // if (pagerRef.current) {
    //   pagerRef.current.setPage(0);
    // }
  };

  const setHourly = () => {
    setCurrentData(mockhourly);
  }

  const setWeekly = () => {
    setCurrentData(weeklyData);
  }


  const useLocationCheckin = () => {
    Alert.alert(
      'At the office',
      'It seems like you are at the office, would you like to check in?',
      [
        {
          text: 'Check in!',
          onPress: () => checkIn()
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }

  useEffect(() => {
    const LocationCheckin = async () => {
      let checkedInVal = await SecureStore.getItemAsync('CheckedIn');
      setCheckedIn(checkedInVal === "true" ? true : false);
      // console.log(checkedIn.toString());
      if (checkedInVal === "false") {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let location: Location.LocationObject = await Location.getCurrentPositionAsync({});
        // console.log(location.coords.latitude);
        // console.log('Latitude:', location.coords.latitude);
        // console.log('Longitude:', location.coords.longitude);

        const point = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        const insidePolygon = isPointInPolygon(point);

        if (insidePolygon) {
          setShouldCheckin(true);
        }
      }
    }
    LocationCheckin()
  }, []);

  useEffect(() => {
    if (shouldCheckin) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useLocationCheckin();
    }
  }, [shouldCheckin]);

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };

    const getWeeklyPrediction = async () => {
      try {
        const prediction = await getFormattedPredictionData();
        if (prediction) {
          // console.log(prediction);
          setCurrentData(prediction);
          setWeeklyData(prediction);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    }

    const getDayPrediction = async () => {
      try {
        const prediction = await getFormattedDailyPredictionData();
        if (prediction) {
          // console.log(prediction);
          setCurrentDayData(prediction);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    }
    getDayPrediction();
    getWeeklyPrediction();
    getAccentColour();
  }, []);

  useEffect(() => {
    const getUsername = async () => {
      try {
        while (username === '') {
          const name = await fetchUsername();
          setUsername(name);
        }

        // // console.log(name);
        // if (name) {
        //   setUsername(name);
        // } else {
        //   setUsername('Guest'); // Default value if no username is found
        // }
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Guest'); // Default in case of an error
      }
    };

    const getRoomData = async () => {
      try {
        const roomData = await fetchUserBookings();
        if (roomData && roomData.length > 0) {
          setRoomData(roomData[0]);
        } else {
          setRoomData(
            {
              roomName: 'No bookings found',
              date: 'No bookings found',
              start: 'No bookings found',
              end: 'No bookings found',
              checkedIn: false,
              creator: 'N/A',
              emails: [],
              floorNo: "0",
            }
          );
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    getRoomData();
    getUsername();
  }, [username]);

  const [accentColour, setAccentColour] = useState<string>('greenyellow');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        setElapsedTime({ hours, minutes });
      }, 60000); // Update every minute
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startTime]);


  useEffect(() => {
    const intervalId = setInterval(() => {
      setNumbers(prevNumbers => {
        const newNumbers = [getRandomNumber(), ...prevNumbers.slice(0, 14)];
        return newNumbers;
      });
    }, 3000);
    setIsDarkMode(currentTheme === 'dark');
    return () => clearInterval(intervalId);
  }, [currentTheme]);

  const checkIn = () => {
    setCheckedIn(true);
    storeCheckInValue(true);
    // setCurrentData(hourlyData);
    if (startTime === null) {
      setStartTime(new Date());
    }
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={String(id)} variant="accent" action="info">
          <ToastTitle>Check in successful. Have a productive day!</ToastTitle>
        </Toast>
      ),
    });
  };

  const checkOut = () => {
    setCheckedIn(false);
    storeCheckInValue(false);
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={String(id)} variant="accent" action="info">
          <ToastTitle>Travel safe. Have a lovely day further!</ToastTitle>
        </Toast>
      ),
    });
  }

  function extractTimeFromDate(dateString: string): string {
    if (dateString === 'No bookings found') {
      return '';
    }
    const date = new Date(dateString);
    date.setHours(date.getHours() - 2);
    return date.toTimeString().substring(0, 5);
  }

  function extractDateFromDate(dateString: string): string {
    if (dateString === 'No bookings found') {
      return 'Make a booking';
    }
    const date = new Date(dateString);
    return date.toDateString();
  }

  const backgroundColor = isDarkMode ? '#1C1C1E' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';

  return (
    <>
      <ScrollView pt="$16" px="$4" flex={1} flexDirection="column" backgroundColor={backgroundColor}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View flexDirection="row" justifyContent="space-between">
          <View>
            <Text fontSize={wp('5%')} fontWeight="light" color={textColor}>
              Hi {username} 👋
            </Text>
            <Text mt="$4" fontSize={wp('5.5%')} fontWeight="bold" color={textColor}>
              Welcome back to Occupi
            </Text>
          </View>
          <Image
            alt="logo"
            p="$10"
            source={require('../../screens/Login/assets/images/Occupi/file.png')}
            style={{ width: wp('7%'), height: wp('7%'), flexDirection: 'column', tintColor: isDarkMode ? 'white' : 'black' }}
          />
        </View>
        <Text mt="$1" fontSize={wp('4%')} fontWeight="light" color={textColor}>
          Next booking:
        </Text>
        <TouchableOpacity
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: cardBackgroundColor,
            borderRadius: 12,
            backgroundColor: cardBackgroundColor,
            marginVertical: 4,
            flexDirection: "row"

          }}>
          <Image
            width={"45%"}
            h="$full"
            alt="image"
            borderRadius={10}
            source={'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png'}
          />
          <View
            // key={room.title}
            w="$48"
            style={{
              paddingHorizontal: 14,
              paddingVertical: 18,
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: textColor }}>{roomData.roomName}</Text>
            <View flexDirection="column">
              <View flexDirection="row" alignItems="center" justifyContent="space-between" pr="$4">
                <View>
                  <Text my="$1" fontSize={15} fontWeight="$light" color={textColor}>
                    {extractDateFromDate(roomData.date)}
                  </Text>
                  <Text>
                    {extractTimeFromDate(roomData.start)}
                    {extractTimeFromDate(roomData.start) && extractTimeFromDate(roomData.end) ? '-' : ''}
                    {extractTimeFromDate(roomData.end)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View display="flex" flexDirection="row" mt="$1" justifyContent="space-between">
          <Card flexDirection="column" variant="elevated" p="$2.5" mt="$4" style={{ width: wp('43%'), height: hp('13%') }} backgroundColor={cardBackgroundColor} borderRadius={10} >
            <View flexDirection="row" alignItems="center"><Text mr={8} fontWeight={'$bold'} color={textColor} fontSize={20}>Capacity</Text><FontAwesome6 name="arrow-up" size={14} color="yellowgreen" /><Text fontSize={13} color="yellowgreen"> {numbers[0] / 10 + 5}%</Text></View>
            <Text color={textColor} fontSize={28}>{numbers[0]}</Text>
            <Text fontSize={15}>Compared to </Text>
            <Text pb={6} fontSize={15}>Yesterday</Text>
            {/* <View flexDirection="column">
            <View flexDirection="row" alignItems="center"><FontAwesome6 name="arrow-trend-up" size={24} color="yellowgreen" /><Text color="yellowgreen"> {numbers[0] / 10 + 5}%</Text></View>
          </View> */}
          </Card>
          <Card flexDirection="column" alignItems='center' variant="elevated" p="$2.5" mt="$4" style={{ width: wp('43%'), height: hp('13%') }} backgroundColor={cardBackgroundColor} borderRadius={10} >
            <View flexDirection="row" alignItems="center"><Text mr={8} fontWeight={'$bold'} color={textColor} fontSize={20}>Predicted: </Text></View>
            <Text color={valueToColor(currentDayData?.class)} fontSize={28}>Level: {currentDayData?.class}</Text>
            <Text color={valueToColor(currentDayData?.class)} fontSize={18}>{currentDayData?.attendance} people</Text>
          </Card>
        </View>
        <View flexDirection="row" justifyContent="space-between" mt="$6" h="$12" alignItems="center">
          <View w={wp('50%')} flexDirection='row' justifyContent='space-around' h="$12" borderColor={cardBackgroundColor} paddingVertical={5} borderWidth={2} borderRadius={10}>
            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor: activeTab === 'Tab1' ? accentColour : 'transparent',
              }}
              onPress={goToPreviousPage}
            >
              <Text color={activeTab === 'Tab1' ? 'black' : 'gray'} fontSize={16} fontWeight={activeTab === 'Tab1' ? 'bold' : 'normal'}>
                Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor: activeTab === 'Tab2' ? accentColour : 'transparent',
              }}
              onPress={goToNextPage}
            >
              <Text color={activeTab === 'Tab2' ? 'black' : 'gray'} fontSize={16} fontWeight={activeTab === 'Tab2' ? 'bold' : 'normal'}>
                Hourly
              </Text>
            </TouchableOpacity>
          </View>
          {checkedIn ? (
            <Button w={wp('36%')} borderRadius={10} backgroundColor="lightblue" onPress={checkOut}>
              <ButtonText color="black">Check out</ButtonText>
            </Button>
          ) : (
            <Button w={wp('36%')} borderRadius={10} backgroundColor={accentColour} onPress={checkIn}>
              <ButtonText color="black">Check in</ButtonText>
            </Button>
          )}
        </View>
        <View w='$full' height={hp('40%')} mb="$32">
          <PagerView
            initialPage={0}
            style={{ flex: 1, alignItems: 'center' }}
            ref={pagerRef}
          >
            <View key="1" justifyContent='center'>
              <LineGraph data={currentData} />
            </View>
            <View key="2" justifyContent='center'>
              <BarGraph data={currentData} />
            </View>
          </PagerView>
        </View >
        {startTime && (
          <Text>
            Time Elapsed: {elapsedTime.hours} hours and {elapsedTime.minutes} minutes
          </Text>
        )}
      </ScrollView >
      <Navbar />
    </>
  );
};

export default Dashboard;
