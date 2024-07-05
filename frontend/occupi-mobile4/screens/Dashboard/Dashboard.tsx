import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, Dimensions } from 'react-native';
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
} from '@gluestack-ui/themed';
import {
  LineChart
} from "react-native-chart-kit";
import { FontAwesome6 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
// import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import { number } from 'zod';

const getRandomNumber = () => {
  return Math.floor(Math.random() * 20)+300; 
};

const Dashboard = () => {
  const colorScheme = useColorScheme();
  const [numbers, setNumbers] = useState(Array.from({ length: 15 }, getRandomNumber));
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [checkedIn, setCheckedIn] = useState(false);
  const toast = useToast()
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNumbers(prevNumbers => {
        const newNumbers = [getRandomNumber(), ...prevNumbers.slice(0, 14)];
        return newNumbers;
      });
    }, 3000);
    // console.log(numbers);
    setIsDarkMode(colorScheme === 'dark');
    return () => clearInterval(intervalId);
  }, [colorScheme]);

  useEffect(() => {
    const getUserDetails = async () => {
      console.log("heree");
      try {
        const response = await fetch('https://dev.occupi.tech/api/user-details?email=kamogelomoeketse@gmail.com')
        const data = await response.json();
        if (response.ok) {
          saveUserData(JSON.stringify(data));
          console.log(data);
        } else {
          console.log(data);
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <Toast nativeID={id} variant="accent" action="error">
                  <ToastTitle>{data.error.message}</ToastTitle>
                </Toast>
              );
            },
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="error">
                <ToastTitle>Network Error: {error.message}</ToastTitle>
              </Toast>
            );
          },
        });
      }
    };
    getUserDetails();
  }, [toast]);
  
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

  async function saveUserEmail(value) {
    await SecureStore.setItemAsync('email', value);
  }
  async function saveUserData(value) {
    await SecureStore.setItemAsync('UserData', value);
  }

  saveUserEmail('kamogelomoeketse@gmail.com');


  const backgroundColor = isDarkMode ? '#1C1C1E' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';

  return (
    <View pt="$16" px="$4" flex={1} flexDirection="column" backgroundColor={backgroundColor}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View flexDirection="row" justifyContent="space-between">
        <View>
          <Text fontSize={wp('5%')} fontWeight="light" color={textColor}>
            Hi Sabrina 👋
          </Text>
          <Text mt="$4" fontSize={wp('6%')} fontWeight="bold" color={textColor}>
            Welcome to Occupi
          </Text>
        </View>
        <Image
          alt="logo"
          p="$10"
          source={require('../../screens/Login/assets/images/Occupi/file.png')}
          style={{ width: wp('8%'), height: wp('8%'), flexDirection: 'column', tintColor: isDarkMode ? 'white' : 'black' }}
        />
      </View>
      <Card size="lg" variant="elevated" mt="$4" w="$full" h={hp('15%')} backgroundColor={cardBackgroundColor} borderRadius={10} />
      <View display="flex" flexDirection="row" mt="$1" justifyContent="space-between">
        <Card flexDirection="row" justifyContent="center" alignItems="center" variant="elevated" mt="$4" style={{ width: wp('43%'), height: hp('12%') }} backgroundColor={cardBackgroundColor} borderRadius={10} >
          <Text color={textColor} fontSize={40}>{numbers[0]}</Text>
          <View flexDirection="column">
          <View flexDirection="row" alignItems="center"><FontAwesome6 name="arrow-trend-up" size={24} color="yellowgreen" /><Text color="yellowgreen"> {numbers[0]/10+5}%</Text></View>
          </View>
        </Card>
        <Card size="lg" variant="elevated" mt="$4" style={{ width: wp('43%'), height: hp('12%') }} backgroundColor={cardBackgroundColor} borderRadius={10} />
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
          width={Dimensions.get("window").width -30} // from react-native
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
      <Navbar />
    </View>
  );
};

export default Dashboard;
