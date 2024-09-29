import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  Animated,
  useWindowDimensions
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
  ChevronDownIcon,
  Feather
} from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import { Icon, ScrollView, View, Text, Image, Divider } from '@gluestack-ui/themed';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
// import Carousel from 'react-native-snap-carousel';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from 'react-native-calendars/src/types';
import { PageIndicator } from 'react-native-page-indicator';
import { useTheme } from '@/components/ThemeContext';

type RootStackParamList = {
  BookingDetails: undefined;
};

interface Images {
  highRes: string;
  lowRes: string;
  midRes: string;
  thumbnailRes: string;
}

interface Room {
  _id: string;
  roomName: string;
  roomId: string;
  roomNo: number;
  floorNo: number;
  minOccupancy: number;
  maxOccupancy: number;
  description: string;
  roomImage : Images;
}

const pages = ['Page 1', 'Page 2', 'Page 3'];

const OfficeDetails = () => {
  const [date, setDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const router = useRouter();
  const { theme } = useTheme();
  const colorscheme = useColorScheme();
  const currentTheme = theme === "system" ? colorscheme : theme;
  const isDarkMode = currentTheme === 'dark';
  const [room, setRoom] = useState<Room>();
  const [resolution, setResolution] = useState("low");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const animatedCurrent = useRef(Animated.divide(scrollX, width)).current;
  const getUpcomingDates = () => {
    const dates = [];
    for (let i = 1; i <= 4; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };
  const upcomingDates = getUpcomingDates();
  const [accentColour, setAccentColour] = useState<string>('greenyellow');

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };
    getAccentColour();
  }, []);

  useEffect(() => {
    const getCurrentRoom = async () => {
      let result : string = await SecureStore.getItemAsync('CurrentRoom');
      // console.log("CurrentRoom:",result);
      // setUserDetails(JSON.parse(result).data);
      let jsonresult = JSON.parse(result);
      // console.log(jsonresult);
      setRoom(jsonresult);
    };
    const setResolutionToMid = () => {
      setTimeout(() => {
        setResolution("mid");
      }, 1000);
    };
  
    const setResolutionToHigh = () => {
      setTimeout(() => {
        setResolution("high");
      }, 3000);
    };
    setResolutionToMid();
    setResolutionToHigh();
    getCurrentRoom();
  }, []);

  const handleBookRoom = async () => {
    // console.log('Booking Room');
    // console.log(date);
    // console.log(startTime);
    // console.log(endTime);
    // console.log(room?.roomName);
    // console.log(room?.roomId);
    // console.log(room?.floorNo);

    // Check if any of the required fields are blank
    if (!date || !startTime || !endTime) {
      alert('Please fill in all the information.');
      return; // Exit the function to prevent further execution
    }

    // Compare startTime and endTime
    const start = new Date(`1970-01-01T${startTime}Z`);
    const end = new Date(`1970-01-01T${endTime}Z`);
    if (end <= start) {
      alert('End time cannot be before start time.');
      return; // Exit the function to prevent further execution
    }

    let bookingInfo = {
      date: date,
      startTime: startTime,
      endTime: endTime,
      roomName: room?.roomName,
      roomId: room?.roomId,
      floorNo: room?.floorNo,
      minOccupancy: room?.minOccupancy,
      maxOccupancy: room?.maxOccupancy,
      roomImage: room?.roomImage
    };

    // console.log(bookingInfo);
    await SecureStore.setItemAsync('BookingInfo', JSON.stringify(bookingInfo));
    router.replace('/booking-details');
  }

  // console.log(theme);
  // console.log(room?);
  // console.log(userEmail);

  return (
    <>
      {/* Top Section */}
      <View pt="$12" px="$8" pb="$4" backgroundColor={isDarkMode ? 'black' : 'white'} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Icon right="$4" as={Feather} name="chevron-left" size="xl" color={currentTheme === 'dark' ? 'white' : 'black'} onPress={() => navigation.goBack()} />
        <Text right="$2" fontWeight="$bold" fontSize={22} style={{ color: isDarkMode ? '#fff' : '#000' }}>{room?.roomName}</Text>
        <View alignItems="center" flexDirection="row" w="$24" justifyContent="space-between">
          <View rounded="$full" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} p="$2">
            <Feather name="heart" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </View>
          <View rounded="$full" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} p="$2">
            <Feather name="share" mx="$8" size={24} color={currentTheme === 'dark' ? 'white' : 'black'} />
          </View>
        </View>
      </View >
      <ScrollView style={{ backgroundColor: isDarkMode ? '#000' : '#fff' }}>
        <View height="$64" mt="$2" mb="$8">
          <View>
            <Animated.ScrollView
              horizontal={true}
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: true,
              })}
            >
              {pages.map((page, index) => (
                <View key={index} style={{ width }}>
                  <View style={styles.page} key="1">
                    <Image alt="slide1" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
            <View style={styles.pageIndicator}>
              <PageIndicator count={pages.length} color={accentColour} current={animatedCurrent} />
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: wp('5%') }}>
          <Text fontSize={24} fontWeight="$bold" mt="$2" mb="$3" style={{ color: isDarkMode ? '#fff' : '#000' }}>{room?.roomName}</Text>
          <View alignItems="center" flexDirection="row">
            <Ionicons name="wifi" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}> Fast   </Text>
            <MaterialCommunityIcons name="television" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text color={isDarkMode ? '#fff' : '#000'}> OLED   </Text>
            <Octicons name="people" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text color={isDarkMode ? '#fff' : '#000'}> {room?.minOccupancy} - {room?.maxOccupancy}   </Text>
            <Feather name="layers" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}> Floor: {room?.floorNo === 0 ? 'G' : room?.floorNo}</Text>
          </View>
        </View>

        {/* Category Icons */}
        {/* <Text style={{ fontSize: wp('6%'), color: isDarkMode ? '#fff' : '#000', paddingLeft: wp('5%') }}>Categories</Text> */}
        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: wp('5%') }}>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="coffee" size={wp('6%')} color="#2196F3" />
            <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: wp('4%'), marginTop: hp('0.5%') }}>Focus</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="leaf" size={wp('6%')} color="#4CAF50" />
            <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: wp('4%'), marginTop: hp('0.5%') }}>Chill</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="lightbulb-on" size={wp('6%')} color="#FFC107" />
            <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: wp('4%'), marginTop: hp('0.5%') }}>Ideas</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="volume-high" size={wp('6%')} color="#9C27B0" />
            <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: wp('4%'), marginTop: hp('0.5%') }}>Loud</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="gamepad-variant" size={wp('6%')} color="#E91E63" />
            <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: wp('4%'), marginTop: hp('0.5%') }}>Game</Text>
          </View>
        </View> */}

        {/* Description */}
        <View px="$5">
          <Text fontSize={24} fontWeight="$bold" style={{ color: isDarkMode ? '#fff' : '#000' }}>Description</Text>
          <Text fontSize={16} style={{ color: isDarkMode ? '#fff' : '#000' }}>
            {room?.description}
          </Text>
        </View>
        <Divider my="$2" bg="$grey" w="80%" alignSelf='center' />
        <View mx="$4">
          <Text color={isDarkMode ? '#fff' : '#000'}>Date:</Text>
          <RNPickerSelect
            darkTheme={isDarkMode ? true : false}
            onValueChange={(value) => { setDate(value) }}
            items={[
              { label: upcomingDates[0], value: upcomingDates[0] },
              { label: upcomingDates[1], value: upcomingDates[1] },
              { label: upcomingDates[2], value: upcomingDates[2] },
              { label: upcomingDates[3], value: upcomingDates[3] },
            ]}
            placeholder={{ label: 'Select a date', value: null, color: isDarkMode ? '#fff' : '#000' }}
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 12,
                marginVertical: 4,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: 'lightgrey',
                borderRadius: 10,
                color: isDarkMode ? '#fff' : '#000',
                paddingRight: 30, // to ensure the text is never behind the icon
              },
              inputAndroid: {
                fontSize: 16,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: 'lightgrey',
                borderRadius: 4,
                color: isDarkMode ? '#fff' : '#000',
                backgroundColor: isDarkMode ? '#2e2e2e' : '#e5e5e5',
                paddingRight: 30, // to ensure the text is never behind the icon
              }
            }}
            Icon={() => {
              return <Icon as={ChevronDownIcon} m="$2" w="$4" h="$4" alignSelf="center" />;
            }}
          />
        </View>
        <View mx="$4" flexDirection='$row' mt="$2" justifyContent='space-between'>
          <View width="45%">
            <Text color={isDarkMode ? '#fff' : '#000'}>Start Time:</Text>
            <RNPickerSelect
              darkTheme={isDarkMode ? true : false}
              onValueChange={(value) => setStartTime(value)}
              items={[
                { label: '07:00', value: '07:00' },
                { label: '08:00', value: '08:00' },
                { label: '09:00', value: '09:00' },
                { label: '10:00', value: '10:00' },
                { label: '11:00', value: '11:00' },
                { label: '12:00', value: '12:00' },
                { label: '13:00', value: '13:00' },
                { label: '14:00', value: '14:00' },
                { label: '15:00', value: '15:00' },
                { label: '16:00', value: '16:00' }
              ]}
              placeholder={{ label: 'Select a time', value: null, color: isDarkMode ? '#fff' : '#000' }}
              style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 12,
                  marginVertical: 4,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  borderRadius: 10,
                  color: isDarkMode ? '#fff' : '#000',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  borderRadius: 4,
                  color: isDarkMode ? '#fff' : '#000',
                  backgroundColor: isDarkMode ? '#2e2e2e' : '#e5e5e5',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
              }}
              Icon={() => {
                return <Icon as={ChevronDownIcon} m="$2" w="$4" h="$4" alignSelf="center" />;
              }}
            />
          </View>
          <View width="45%">
            <Text color={isDarkMode ? '#fff' : '#000'}>End Time:</Text>
            <RNPickerSelect
              darkTheme={isDarkMode ? true : false}
              onValueChange={(value) => setEndTime(value)}
              items={[
                { label: '08:00', value: '08:00' },
                { label: '09:00', value: '09:00' },
                { label: '10:00', value: '10:00' },
                { label: '11:00', value: '11:00' },
                { label: '12:00', value: '12:00' },
                { label: '13:00', value: '13:00' },
                { label: '14:00', value: '14:00' },
                { label: '15:00', value: '15:00' },
                { label: '16:00', value: '16:00' },
                { label: '17:00', value: '17:00' }
              ]}
              placeholder={{ label: 'Select a time', value: null, color: isDarkMode ? '#fff' : '#000' }}
              style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 12,
                  marginVertical: 4,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  borderRadius: 10,
                  color: isDarkMode ? '#fff' : '#000',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  borderRadius: 4,
                  color: isDarkMode ? '#fff' : '#000',
                  backgroundColor: isDarkMode ? '#2e2e2e' : '#e5e5e5',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
              }}
              Icon={() => {
                return <Icon as={ChevronDownIcon} m="$2" w="$4" h="$4" alignSelf="center" />;
              }}
            />
          </View>
        </View>

        {/* Check Availability Button */}
        <TouchableOpacity style={{ margin: wp('5%') }} onPress={() => handleBookRoom()}>
          <LinearGradient
            colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ padding: wp('4%'), alignItems: 'center', borderRadius: 18 }}
          >
            <Text color={isDarkMode ? '#000' : '#fff'} fontSize={16} fontWeight="$bold">Check availability</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageIndicator: {
    // left: 20,
    // right: 20,
    // bottom: 50,
    // position: 'absolute',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OfficeDetails;

export const calendarTheme: Theme = {
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#b6c1cd',
  textSectionTitleDisabledColor: '#d9e1e8',
  selectedDayBackgroundColor: '#00adf5',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#00adf5',
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  dotColor: '#00adf5',
  selectedDotColor: '#ffffff',
  arrowColor: 'orange',
  disabledArrowColor: '#d9e1e8',
  monthTextColor: 'blue',
  indicatorColor: 'blue',
  textDayFontFamily: 'monospace',
  textMonthFontFamily: 'monospace',
  textDayHeaderFontFamily: 'monospace',
  textDayFontWeight: '300',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '300',
  textDayFontSize: 16,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 16,
};
