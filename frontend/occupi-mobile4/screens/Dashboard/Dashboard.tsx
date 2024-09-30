import React, { useEffect, useRef, useState } from 'react';
import { useColorScheme, TouchableOpacity, Alert,Modal } from 'react-native';
import Navbar from '../../components/NavBar';
import Entypo from '@expo/vector-icons/Entypo';
import {
  Text,
  View,
  Image, Toast,
  useToast,
  ToastTitle,
  Button,
  ButtonText,
  ScrollView
} from '@gluestack-ui/themed';
// import {
//   LineChart
// } from "react-native-chart-kit";
import * as SecureStore from 'expo-secure-store';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { enter, exit, useCentrifugeCounter } from '@/utils/rtc';
import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { fetchUsername } from '@/utils/user';
import { Booking } from '@/models/data';
import { fetchTopBookings } from '@/utils/bookings';
import { useTheme } from '@/components/ThemeContext';
import LineGraph from '@/components/LineGraph';
import BarGraph from '@/components/BarGraph';
import { getFormattedPredictionData, getFormattedPredictionWeekData, getHourlyPredictions, mapToClassForSpecificHours } from '@/utils/occupancy';
import * as Location from 'expo-location';
import { storeCheckInValue } from '@/services/securestore';
import { isPointInPolygon, onSite } from '@/utils/dashboard';
import { extractDateFromTimestamp } from '@/utils/utils';
import PagerView from 'react-native-pager-view';
import { router } from 'expo-router';
import Tooltip from '@/components/Tooltip';
import { getCurrentBookings } from '@/utils/analytics';
import Recommendations from './Recommendations';
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
  const [topBookings, setTopBookings] = useState([]);
  const [roomData, setRoomData] = useState<Booking>({});
  const [username, setUsername] = useState('');
  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [shouldCheckin, setShouldCheckin] = useState(false);
  const toast = useToast();
  const [currentData, setCurrentData] = useState();
  const pagerRef = useRef<PagerView>(null);
  const [activeTab, setActiveTab] = useState(1);
  const [weeklyData, setWeeklyData] = useState();
  const [hourlyData, setHourlyData] = useState();
  const counter = 0;
  const [isRecommendationsVisible, setIsRecommendationsVisible] = useState(false);

  // console.log(isDarkMode);

  // console.log('darkmode? ', isDarkMode);


  const mockhourly = [
    { "label": "7am", "value": 2 },
    { "label": "9am", "value": 4 },
    { "label": "11am", "value": 5 },
    { "label": "12pm", "value": 2 },
    { "label": "1pm", "value": 2 },
    { "label": "3pm", "value": 3 },
    { "label": "5pm", "value": 2 }
  ]

  // console.log(currentData);

  const showLive = () => {
    setActiveTab(1);
    setDate("");
    // if (pagerRef.current) {
    //   pagerRef.current.setPage(1);
    // }
    setHourly();
  };

  const showHourly = () => {
    setActiveTab(2);
    setHourly();
    setDate("");
    // if (pagerRef.current) {
    //   pagerRef.current.setPage(0);
    // }
  };

  const showWeek = () => {
    setActiveTab(3);
    setWeekly();
    setDate("");
    // if (pagerRef.current) {
    //   pagerRef.current.setPage(0);
    // }
  };

  const showMonth = () => {
    setActiveTab(4);
    setWeekly();
    setDate("");
    // if (pagerRef.current) {
    //   pagerRef.current.setPage(0);
    // }
  };

  const setHourly = () => {
    setCurrentData(hourlyData);
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
      console.log('checkedin: ', checkedInVal);
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

    const getTopBookings = async () => {
      try {
        const topBookings = await fetchTopBookings();
        // console.log('yurppp', topBookings);
        setTopBookings(topBookings);
      } catch (error) {
        console.error('Error fetching top bookings', error);
      }
    }

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

    const getHourlyPrediction = async () => {
      try {
        const prediction = await mapToClassForSpecificHours();
        setHourlyData(prediction);
        console.log('hourly',prediction);
        // if (prediction) {
        //   // console.log(prediction);
        //   setCurrentData(prediction);
        //   setWeeklyData(prediction);
        // }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    }

    getHourlyPrediction();
    getWeeklyPrediction();
    getAccentColour();
    getTopBookings();
  }, []);

  const getPredictionsFromWeek = async (date: string) => {
    try {
      const prediction = await getFormattedPredictionWeekData(date);
      if (prediction) {
        // console.log(prediction);
        setCurrentData(prediction);
        // setWeeklyData(prediction);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  }

  const handleRoomClick = async (value: string) => {
    if (JSON.parse(value).roomName === 'No bookings found') {
      router.push('/bookings');
      return;
    }
    await SecureStore.setItemAsync('CurrentRoom', value);
    router.push('/viewbookingdetails');
    console.log(value);
  }

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
        const roomData = await getCurrentBookings();
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
              occupiId: "0",
              roomId: "0",
              roomImage: {}
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
    // const intervalId = setInterval(() => {
    //   setNumbers(prevNumbers => {
    //     const newNumbers = [getRandomNumber(), ...prevNumbers.slice(0, 14)];
    //     return newNumbers;
    //   });
    // }, 3000);
    setIsDarkMode(currentTheme === 'dark');
    // return () => clearInterval(intervalId);
  }, [currentTheme]);

  const checkIn = async () => {
    const entered = await enter();
    // await onSite("Yes");
    console.log(entered);
    if (entered.status === 200) {
      setCheckedIn(true);
      storeCheckInValue(true);

      // setCurrentData(hourlyData);
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={String(id)} variant="accent" action="info">
            <ToastTitle>Check in successful. Have a productive day!</ToastTitle>
          </Toast>
        ),
      });
    } else {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={String(id)} variant="accent" action="info">
            <ToastTitle>Failed to Check In. Check connection.</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const checkOut = async () => {
    const exited = await exit();
    // await onSite("No");
    console.log(exited);
    if (exited.status === 200) {
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
    } else {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={String(id)} variant="accent" action="info">
            <ToastTitle>Failed to Check Out. Check connection.</ToastTitle>
          </Toast>
        ),
      });
    }
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

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const handleConfirm = (date: Date) => {
    const selectedDate: string = date.toString();
    console.log('selected', extractDateFromTimestamp(selectedDate));
    setDate(extractDateFromTimestamp(selectedDate));
    getPredictionsFromWeek(extractDateFromTimestamp(selectedDate));
    hideDatePicker();
  };

  const backgroundColor = isDarkMode ? 'black' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#101010' : '#F3F3F3';
  const recommendationColor = isDarkMode ? '#6e6d6d' : '#F3F3F3';

  return (
    <>
      <ScrollView pt="$16" px="$3" backgroundColor={backgroundColor} showsVerticalScrollIndicator={false}>
        {/* <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} /> */}
        <View flexDirection="row" alignItems='center' justifyContent="space-between">
          <View justifyContent='flex-start'>
            <Text fontSize={wp('3%')} fontWeight="light" color={textColor}>
              {username}
            </Text>
            <Text mt="$2" fontSize={wp('5.5%')} fontWeight="bold" color={textColor}>
              Dashboard
            </Text>
          </View>
          <Image
            alt="logo"
            p="$10"
            source={require('../../screens/Login/assets/images/Occupi/file.png')}
            style={{ width: wp('7%'), height: wp('7%'), flexDirection: 'column', tintColor: isDarkMode ? 'white' : 'black' }}
          />
        </View>
        <View pb="$1" pt="$4" borderRadius={7} backgroundColor={cardBackgroundColor}>
          <View alignItems='center'>
            <Text fontWeight="bold" flexDirection='row' fontSize={wp('7%')} color={textColor}>
              {counter}
            </Text>
            <View py="$2" flexDirection='row' alignItems='center'><Entypo name="triangle-up" size={20} color="green" /><Text fontSize={wp('4%')} color="green">1.35%</Text><Text fontSize={wp('4%')}> Today</Text></View>
          </View>
          <View w='$full' height={hp('30%')}>
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
          <View flexDirection='row' alignItems='center' justifyContent='space-around' h="$12" paddingVertical={5}>
            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: activeTab !== 1 ? 'transparent' : isDarkMode === true ? '#242424' : 'lightgrey',
              }}
              onPress={showLive}
            >
              <Text color={activeTab === 1 ? textColor : 'gray'} fontSize={16} fontWeight={activeTab === 1 ? 'bold' : 'normal'}>
                Live
                {/* <Tooltip
                  content="Know what's happening in the office, live!"
                  placement="bottom"
                /> */}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor: activeTab !== 2 ? 'transparent' : isDarkMode === true ? '#242424' : 'lightgrey',
              }}
              onPress={showHourly}
            >
              <Text color={activeTab === 2 ? textColor : 'gray'} fontSize={16} fontWeight={activeTab === 2 ? 'bold' : 'normal'}>
                1D
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor: activeTab !== 3 ? 'transparent' : isDarkMode === true ? '#242424' : 'lightgrey',
              }}
              onPress={showWeek}
            >
              <Text color={activeTab === 3 ? textColor : 'gray'} fontSize={16} fontWeight={activeTab === 3 ? 'bold' : 'normal'}>
                1W
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: activeTab !== 4 ? 'transparent' : isDarkMode === true ? '#242424' : 'lightgrey',
              }}
              onPress={showMonth}
            >
              <Text color={activeTab === 4 ? textColor : 'gray'} fontSize={16} fontWeight={activeTab === 4 ? 'bold' : 'normal'}>
                1M
              </Text>
            </TouchableOpacity>
          </View>
          {activeTab !== 1 &&
            <>
              <TouchableOpacity
                style={{
                  paddingVertical: 7,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  backgroundColor: isDarkMode === true ? '#242424' : 'lightgrey',
                  marginHorizontal: 48,
                  marginTop: 8,
                  marginBottom: 8,
                  alignItems: 'center'
                }}
                onPress={showDatePicker}
              >
                {date ? (
                  <Text color={textColor} fontSize={16}>
                    Week from: {date}
                  </Text>
                ) : (
                  activeTab === 2 ? (
                    <Text color={textColor} fontSize={16}>Select Day:</Text>
                  ) : activeTab === 3 ? (
                    <Text color={textColor} fontSize={16}>Select Week From:</Text>
                  ) : activeTab === 4 && (
                    <Text color={textColor} fontSize={16}>Select Month:</Text>
                  )
                )}

              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                // display="calendar"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </>
          }
        </View>
        <View mt="$4" alignItems='center' flexDirection='row' justifyContent='space-between'>
          {checkedIn ? (
            <Button w={wp('45%')} borderRadius={10} backgroundColor="lightblue" onPress={checkOut}>
              <ButtonText color="black">Check out</ButtonText>
            </Button>
          ) : (
            <Button w={wp('45%')} borderRadius={10} backgroundColor={accentColour} onPress={checkIn}>
              <ButtonText color="black">Check in</ButtonText>
            </Button>
          )}
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingHorizontal: 20,
              borderRadius: 8,
              // marginTop: 18,
              height: 60,
              backgroundColor: cardBackgroundColor,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => router.push('/stats')}
          >
            <View flexDirection="row" alignItems="center" justifyContent='space-between'>
              <View flexDirection='row' alignItems='center'>
                <Text color={textColor} fontWeight="$bold" fontSize={18}>My Stats </Text>
                <Tooltip
                  content="Get your personalized office information with OccuBot."
                  placement="bottom"
                />
              </View>
              <Ionicons name="chevron-forward-outline" size={30} color={textColor} />
            </View>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingHorizontal: 20,
              borderRadius: 8,
              marginTop: 18,
              height: 60,
              backgroundColor: recommendationColor,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => setIsRecommendationsVisible(true)}
          >
            <View flexDirection="row" alignItems="center" justifyContent='space-between'>
              <View flexDirection='row' alignItems='center'>
                <Text color={textColor} fontWeight="$bold" fontSize={18}>Recommendations</Text>
                <Tooltip
                  content="Office too full? Need help on when to check in? OccuBot's got you covered."
                  placement="bottom"
                />
              </View>
              <Ionicons name="chevron-forward-outline" size={30} color={textColor} />
            </View>
          </TouchableOpacity>
        </View>

        <View px="$4" mt="$4" pb="$1" pt="$4" borderRadius={7} backgroundColor={cardBackgroundColor}>
          <View flexDirection='row' alignItems='center'>
            <Text fontSize={18} color={textColor}>Top Bookings </Text>
            <Tooltip
              content="Learn more about your Favourite office days below."
              placement="bottom"
            />
          </View>
          <View flexDirection='row' alignItems='center' py="$4" my="$2" px="$4" justifyContent='space-between' borderRadius={15} backgroundColor={isDarkMode === true ? '#242424' : 'lightgrey'} h={hp('8%')}>
            <Text color={textColor} fontWeight="$bold" fontSize={16}>1 </Text>
            <View>
              <Text color={textColor} fontWeight="$bold" fontSize={16}>{topBookings[0]?.roomName}</Text>
              <Text color={textColor} fontWeight="$bold" fontSize={16}>Floor: {topBookings[0]?.floorNo === '0' ? 'G' : topBookings[0]?.floorNo}</Text>
            </View>
            <Text color={textColor}>{topBookings[0]?.count} bookings</Text>
          </View>
          <View flexDirection='row' alignItems='center' my="$2" px="$4" justifyContent='space-between' borderRadius={15} backgroundColor={isDarkMode === true ? '#242424' : 'lightgrey'} h={hp('6%')}>
            <Text color={textColor} fontWeight="$bold" fontSize={16}>2 </Text>
            <View>
              <Text color={textColor} fontWeight="$bold" fontSize={16}>{topBookings[1]?.roomName}</Text>
              <Text color={textColor} fontWeight="$bold" fontSize={16}>Floor: {topBookings[1]?.floorNo === '0' ? 'G' : topBookings[1]?.floorNo}</Text>
            </View>
            <Text color={textColor}>{topBookings[1]?.count} bookings</Text>
          </View>
          <View flexDirection='row' alignItems='center' my="$2" px="$4" justifyContent='space-between' borderRadius={15} backgroundColor={isDarkMode === true ? '#242424' : 'lightgrey'} h={hp('6%')}>
            <Text color={textColor} fontWeight="$bold" fontSize={16}>3 </Text>
            <View>
              <Text color={textColor} fontWeight="$bold" fontSize={16}>{topBookings[2]?.roomName}</Text>
              <Text color={textColor} fontWeight="$bold" fontSize={16}>Floor: {topBookings[2]?.floorNo === '0' ? 'G' : topBookings[2]?.floorNo}</Text>
            </View>
            <Text color={textColor}>{topBookings[2]?.count} bookings</Text>
          </View>
        </View>
        <View mb="$48" px="$4" mt="$4" pb="$3" pt="$2" borderRadius={7} backgroundColor={cardBackgroundColor}>
          <Text mt="$1" fontSize={18} fontWeight="light" color={textColor}>
            Next booking:
          </Text>
          <TouchableOpacity
            onPress={() => handleRoomClick(JSON.stringify(roomData))}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: cardBackgroundColor,
              borderRadius: 12,
              backgroundColor: cardBackgroundColor,
              marginTop: 4,
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
        </View>
      </ScrollView >
      <Navbar style={{ position: 'absolute', bottom: 0, width: '100%' }} />

    <Modal
        animationType="slide"
        transparent={true}
        visible={isRecommendationsVisible}
        onRequestClose={() => setIsRecommendationsVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: backgroundColor,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 35,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            height: '80%' // Adjust this value to control how much of the screen the modal covers
          }}>
            <Recommendations onClose={() => setIsRecommendationsVisible(false)} />
          </View>
        </View>
      </Modal>
    </>

  );
};

export default Dashboard;
