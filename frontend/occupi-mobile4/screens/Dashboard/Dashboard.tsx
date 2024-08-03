import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, Dimensions, TouchableOpacity } from 'react-native';
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
import {
  LineChart
} from "react-native-chart-kit";
import { FontAwesome6, Octicons, SimpleLineIcons } from '@expo/vector-icons';
// import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { fetchUsername } from '@/utils/user';
import { Booking } from '@/models/data';
import { fetchUserBookings } from '@/utils/bookings';
// import { number } from 'zod';

const getRandomNumber = () => {
  return Math.floor(Math.random() * 20) + 300;
};

const Dashboard = () => {
  const colorScheme = useColorScheme();
  const [numbers, setNumbers] = useState(Array.from({ length: 15 }, getRandomNumber));
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [checkedIn, setCheckedIn] = useState(false);
  const [roomData, setRoomData] = useState<Booking>({});
  const [username, setUsername] = useState('');
  const toast = useToast();

  useEffect(() => {
    const getUsername = async () => {
      try {
        const name = await fetchUsername();
        console.log(name);
        if (name) {
          setUsername(name);
        } else {
          setUsername('Guest'); // Default value if no username is found
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Guest'); // Default in case of an error
      }
    };

    const getRoomData = async () => {
      try {
        const roomData = await fetchUserBookings();
        if (roomData) {
          // console.log(roomData);
          setRoomData(roomData[0]);
          console.log(roomData[0]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    getRoomData();
    getUsername();
  }, []);


  useEffect(() => {
    const intervalId = setInterval(() => {
      setNumbers(prevNumbers => {
        const newNumbers = [getRandomNumber(), ...prevNumbers.slice(0, 14)];
        return newNumbers;
      });
    }, 3000);
    setIsDarkMode(colorScheme === 'dark');
    return () => clearInterval(intervalId);
  }, [colorScheme]);

  const checkIn = () => {
    if (checkedIn === false) {
      setCheckedIn(true);
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={String(id)} variant="accent" action="info">
            <ToastTitle>Check in successful. Have a productive day!</ToastTitle>
          </Toast>
        ),
      });
    } else {
      setCheckedIn(false);
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={String(id)} variant="accent" action="info">
            <ToastTitle>Travel safe. Have a lovely day further!</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  function extractTimeFromDate(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() - 2);
    return date.toTimeString().substring(0, 5);
  }

  function extractDateFromDate(dateString: string): string {
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
                  <Text my="$1" fontSize={15} fontWeight="$light" color={textColor}>{extractDateFromDate(roomData.date)}</Text>
                  <Text>{extractTimeFromDate(roomData.start)}-{extractTimeFromDate(roomData.end)}</Text>
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
            <Text fontSize={15}>Yesterday</Text>
            {/* <View flexDirection="column">
            <View flexDirection="row" alignItems="center"><FontAwesome6 name="arrow-trend-up" size={24} color="yellowgreen" /><Text color="yellowgreen"> {numbers[0] / 10 + 5}%</Text></View>
          </View> */}
          </Card>
          <Card size="lg" variant="elevated" mt="$4" style={{ width: wp('43%'), height: hp('13%') }} backgroundColor={cardBackgroundColor} borderRadius={10} />
        </View>
        <View flexDirection="row" justifyContent="flex-end" mt="$6" mb="$4" h="$8" alignItems="center">
          {checkedIn ? (
            <Button w={wp('36%')} borderRadius={10} backgroundColor="lightblue" onPress={checkIn}>
              <ButtonText color="dimgrey">Check out</ButtonText>
            </Button>
          ) : (
            <Button w={wp('36%')} borderRadius={10} backgroundColor="greenyellow" onPress={checkIn}>
              <ButtonText color="dimgrey">Check in</ButtonText>
            </Button>
          )}
        </View>
        {/* <Image
        alt="logo"
        p="10"
        source={require('./assets/graph.png')}
        style={{ width: wp('100%'), height: hp('31%'), flexDirection: 'column', tintColor: isDarkMode ? 'white' : 'black' }}
      /> */}
        <View>
          <Text color={textColor}>Occupancy levels</Text>
          <LineChart
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            // fromZero={true}
            data={{
              labels: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
              datasets: [
                {
                  data: [
                    numbers[14],
                    numbers[13],
                    numbers[12],
                    numbers[11],
                    numbers[10],
                    numbers[9],
                    numbers[8],
                    numbers[7],
                    numbers[6],
                    numbers[5],
                    numbers[4],
                    numbers[3],
                    numbers[2],
                    numbers[1],
                    numbers[0]
                  ]
                }
              ]
            }}
            width={Dimensions.get("window").width - 30} // from react-native
            height={220}
            // yAxisLabel=""
            // yAxisSuffix="k"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: "white",
              backgroundGradientFrom: "yellowgreen",
              backgroundGradientTo: "cyan",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 20
              },
              propsForDots: {
                r: "0",
                strokeWidth: "2",
                stroke: "green"
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </ScrollView>
      <Navbar />
    </>
  );
};

export default Dashboard;
