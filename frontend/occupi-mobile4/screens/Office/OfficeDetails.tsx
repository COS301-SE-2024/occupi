import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Modal,
  useColorScheme,
  StyleSheet,
  Animated,
  useWindowDimensions
} from 'react-native';
import {
  Ionicons,
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
  Octicons,
  ChevronDownIcon,
  Feather
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import { Icon, ScrollView, View, Text, Image } from '@gluestack-ui/themed';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
// import Carousel from 'react-native-snap-carousel';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from 'react-native-calendars/src/types';
import slotsData from './availableSlots.json';
import PagerView from 'react-native-pager-view';
import { PageIndicator } from 'react-native-page-indicator';


type RootStackParamList = {
  BookingDetails: undefined;
};

interface Room {
  _id: string;
  roomName: string;
  roomId: string;
  roomNo: number;
  floorNo: number;
  minOccupancy: number;
  maxOccupancy: number;
  description: string;
}

const images = [
  {
    uri: 'https://cdn-bnokp.nitrocdn.com/QNoeDwCprhACHQcnEmHgXDhDpbEOlRHH/assets/images/optimized/rev-15fa1b1/www.decorilla.com/online-decorating/wp-content/uploads/2022/03/Modern-Office-Interior-with-Open-Floor-Plan-1024x683.jpeg',
  },
  {
    uri: 'https://cdn-bnokp.nitrocdn.com/QNoeDwCprhACHQcnEmHgXDhDpbEOlRHH/assets/images/optimized/rev-15fa1b1/www.decorilla.com/online-decorating/wp-content/uploads/2022/03/modern-office-design-for-a-large-conference-room-1024x838.jpeg',
  },
  {
    uri: 'https://cdn-bnokp.nitrocdn.com/QNoeDwCprhACHQcnEmHgXDhDpbEOlRHH/assets/images/optimized/rev-15fa1b1/www.decorilla.com/online-decorating/wp-content/uploads/2022/03/Industrial-style-office-interior-design-Sonia-C-1024x683.jpg',
  },
];

const pages = ['Page 1', 'Page 2', 'Page 3'];

const OfficeDetails = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date(2000, 6, 7));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [slot, setSlot] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const roomParams = useLocalSearchParams();
  const roomData = roomParams.roomData;
  const roomData2 = JSON.parse(roomData);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [availableSlots, setAvailableSlots] = useState({});
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const animatedCurrent = useRef(Animated.divide(scrollX, width)).current;
  useEffect(() => {
    // Load the available slots from the JSON file
    setAvailableSlots(slotsData.slots);
    getData();
  }, []);

  const handleCheckAvailability = () => {
    setModalVisible(true);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    // setDate(selectedDate.toLocaleDateString());
    // console.log(date.toLocaleDateString());
    hideDatePicker();
  };

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('email', value);
    } catch (e) {
      // saving error
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('email');
      // console.log(value);
      setUserEmail(value);
    } catch (e) {
      // error reading value
    }
  };

  // storeData('kamogelomoeketse@gmail.com');

  const renderItem = ({ item }: { item: { uri: string } }) => (
    <View style={{ borderRadius: wp('5%'), overflow: 'hidden' }}>
      <Image source={{ uri: item.uri }} style={{ width: '100%', height: hp('30%') }} />
    </View>
  );

  const handleSlotClick = () => {
    navigation.navigate('/booking-details');
  };

  console.log(roomData2);
  console.log(userEmail);

  return (
    <>
      {/* Top Section */}
      <View pt="$16" backgroundColor={colorScheme === 'dark' ? 'black' : 'white'} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp('5%') }}>
        <Icon right="$4" as={Feather} name="chevron-left" size="40" color={colorScheme === 'dark' ? 'white' : 'black'} onPress={() => navigation.goBack()} />

        <Text right="$8" fontWeight="$bold" fontSize="$22" style={{ color: isDarkMode ? '#fff' : '#000' }}>{roomData2.roomName}</Text>
        <View alignItems="$center" flexDirection="$row" w="$24" justifyContent="$space-between">
          <View rounded="$full" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} p="$2">
            <Feather name="heart" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </View>
          <View rounded="$full" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} p="$2">
            <Feather name="share" mx="$8" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </View>
        </View>
      </View >
      <ScrollView style={{ backgroundColor: isDarkMode ? '#000' : '#fff' }}>
        <View height="$96" mt="$4" mb="$8">
          {/* <PagerView style={styles.container} initialPage={0}>
            <View style={styles.page} key="1">
              <Image alt="slide1" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
            </View>
            <View style={styles.page} key="2">
              <Image alt="slide2" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
            </View>
            <View style={styles.page} key="3">
              <Image alt="slide3" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
            </View>
          </PagerView> */}
          <View style={styles.root}>
            <Animated.ScrollView
              horizontal={true}
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: true,
              })}
            >
              {pages.map((page, index) => (
                <View key={index} style={[styles.page], { width }}>
                  <View style={styles.page} key="1">
                    <Image alt="slide1" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                  </View>
                  <View style={styles.page} key="2">
                    <Image alt="slide2" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                  </View>
                  <View style={styles.page} key="3">
                    <Image alt="slide3" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
            <View style={styles.pageIndicator}>
              <PageIndicator count={pages.length} color={"yellowgreen"} current={animatedCurrent} />
            </View>
          </View>
        </View>
        <View style={{ padding: wp('5%') }}>
          <Text fontSize="$24" fontWeight="$bold" mb="$3" style={{ color: isDarkMode ? '#fff' : '#000' }}>{roomData2.roomName}</Text>
          <View alignItems="center" flexDirection="row">
            <Ionicons name="wifi" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}> Fast   </Text>
            <MaterialCommunityIcons name="television" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text color={isDarkMode ? '#fff' : '#000'}> OLED   </Text>
            <Octicons name="people" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text color={isDarkMode ? '#fff' : '#000'}> {roomData2.minOccupancy} - {roomData2.maxOccupancy}   </Text>
            <Feather name="layers" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}> Floor: {roomData2.floorNo === 0 ? 'G' : roomData2.floorNo}</Text>
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
          <Text fontSize="$24" fontWeight="$bold" style={{ color: isDarkMode ? '#fff' : '#000' }}>Description</Text>
          <Text fontSize="$16" style={{ color: isDarkMode ? '#fff' : '#000' }}>
            {roomData2.description}
          </Text>
        </View>
        <View mx="$4">
          <RNPickerSelect
            onValueChange={(value) => setSlot(value)}
            items={[
              { label: '07:00 - 08:00', value: '1' },
              { label: '08:00 - 09:00', value: '2' },
              { label: '09:00 - 10:00', value: '3' },
              { label: '10:00 - 11:00', value: '4' },
              { label: '11:00 - 12:00', value: '5' },
              { label: '12:00 - 13:00', value: '6' },
              { label: '13:00 - 14:00', value: '7' },
              { label: '14:00 - 15:00', value: '8' },
              { label: '15:00 - 16:00', value: '9' },
              { label: '16:00 - 17:00', value: '10' }
            ]}
            placeholder={{ label: 'Select a slot', value: null, color: isDarkMode ? '#fff' : '#000' }}
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 12,
                marginVertical: 12,
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
                paddingRight: 30, // to ensure the text is never behind the icon
              },
            }}
            Icon={() => {
              return <Icon as={ChevronDownIcon} m="$2" w="$4" h="$4" alignSelf="center" />;
            }}
          />
        </View>
        {/* Check Availability Button */}
        <TouchableOpacity bottom="$0" style={{ margin: wp('5%') }} onPress={() => router.push({ pathname: '/booking-details', params: { email: userEmail, slot: slot, roomId: roomData2.roomId, floorNo: roomData2.floorNo, roomData: roomData } })}>
          <LinearGradient
            colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ padding: wp('4%'), alignItems: 'center', borderRadius: 18 }}
          >
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
            <Text color={isDarkMode ? '#000' : '#fff'} fontSize="$16" fontWeight="$bold">Check availability</Text>
          </LinearGradient>
        </TouchableOpacity>


        {/* Modal for Calendar */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={{ margin: wp('5%'), backgroundColor: isDarkMode ? '#333' : '#fff', borderRadius: wp('5%'), padding: wp('8%'), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: hp('0.25%') }, shadowOpacity: 0.25, shadowRadius: hp('0.5%'), elevation: 5 }}>
            <Text style={{ fontSize: wp('6%'), color: isDarkMode ? '#fff' : '#000', marginBottom: hp('2%') }}>Available slots</Text>
            {/* <CalendarPicker /> */}
            <View style={{ marginTop: hp('2%'), width: '100%' }}>
              {Object.keys(availableSlots).map(date => (
                availableSlots[date].map((slot, index) => (
                  <TouchableOpacity
                    key={`${date}-${index}`}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp('4%'), borderRadius: wp('1%'), backgroundColor: isDarkMode ? '#444' : '#f0f0f0', marginBottom: hp('1%') }}
                    onPress={handleSlotClick}
                  >
                    <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: wp('4%') }}>{date} at {slot}</Text>
                  </TouchableOpacity>
                ))
              ))}
            </View>
            <TouchableOpacity
              style={{ backgroundColor: 'red', padding: wp('2.5%'), borderRadius: wp('1%'), marginTop: wp('5%') }}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={{ color: '#fff', fontSize: wp('4%') }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
    left: 20,
    right: 20,
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
