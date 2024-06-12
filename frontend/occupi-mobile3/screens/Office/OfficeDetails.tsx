import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  useColorScheme,
} from 'react-native';
import {
  Ionicons,
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Carousel from 'react-native-snap-carousel';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from 'react-native-calendars/src/types';
import slotsData from './availableSlots.json';

type RootStackParamList = {
  BookingDetails: undefined;
};

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

const OfficeDetails = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [availableSlots, setAvailableSlots] = useState({});

  useEffect(() => {
    // Load the available slots from the JSON file
    setAvailableSlots(slotsData.slots);
  }, []);

  const handleCheckAvailability = () => {
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: { uri: string } }) => (
    <View style={{ borderRadius: wp('5%'), overflow: 'hidden' }}>
      <Image source={{ uri: item.uri }} style={{ width: '100%', height: hp('30%') }} />
    </View>
  );

  const handleSlotClick = () => {
    navigation.navigate('BookingDetails');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#fff' }}>
      {/* Top Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp('5%') }}>
        <Text style={{ fontSize: wp('6%'), color: isDarkMode ? '#fff' : '#000' }}>The HDMI room</Text>
        <View style={{ flexDirection: 'row' }}>
          <FontAwesome name="heart-o" size={wp('6%')} color={isDarkMode ? '#fff' : '#000'} style={{ marginLeft: wp('2.5%') }} />
          <MaterialIcons name="share" size={wp('6%')} color={isDarkMode ? '#fff' : '#000'} style={{ marginLeft: wp('2.5%') }} />
        </View>
      </View>

      {/* Image Section */}
      <Carousel
        data={images}
        renderItem={renderItem}
        sliderWidth={wp('100%')}
        itemWidth={wp('80%')}
        containerCustomStyle={{ marginTop: wp('5%') }}
        contentContainerCustomStyle={{ paddingLeft: wp('5%') }}
      />

      {/* Details Section */}
      <View style={{ padding: wp('5%') }}>
        <Text style={{ fontSize: wp('6%'), color: isDarkMode ? '#fff' : '#000' }}>The HDMI Room</Text>
        <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: wp('4%'), marginVertical: hp('1%') }}>
          🏃 Fast 📺 OLED 👥 5 people 🏢 Floor 7
        </Text>
      </View>

      {/* Category Icons */}
      <Text style={{ fontSize: wp('6%'), color: isDarkMode ? '#fff' : '#000', paddingLeft: wp('5%') }}>Categories</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: wp('5%') }}>
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
      </View>

      {/* Description */}
      <View style={{ padding: wp('5%') }}>
        <Text style={{ fontSize: wp('6%'), color: isDarkMode ? '#fff' : '#000' }}>Description</Text>
        <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: wp('4%') }}>
          Lorem ipsum dolor sit amet consectetur. Ut lectus rutrum imperdiet enim consectetur egestas sem. Est tellus id nulla morbi. Nibh nulla ut diam morbi cras viverra vivamus risus scelerisque.
        </Text>
      </View>

      {/* Check Availability Button */}
      <TouchableOpacity style={{ margin: wp('5%'), borderRadius: wp('1%') }} onPress={handleCheckAvailability}>
        <LinearGradient
          colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ padding: wp('4%'), alignItems: 'center', borderRadius: wp('1%') }}
        >
          <Text style={{ color: '#fff', fontSize: wp('4%') }}>Check availability</Text>
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
          <Calendar
            style={{ borderWidth: wp('0.25%'), borderColor: 'gray', height: hp('50%'), marginBottom: hp('2%') }}
            theme={calendarTheme}
            markedDates={Object.keys(availableSlots).reduce((acc, date) => {
              acc[date] = { selected: true, selectedColor: 'green' };
              return acc;
            }, {})}
          />
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
  );
};

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
