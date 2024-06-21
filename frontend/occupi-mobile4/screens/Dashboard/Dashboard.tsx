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
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import { FontAwesome6 } from '@expo/vector-icons';
// import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { number } from 'zod';

const getRandomNumber = () => {
  return Math.floor(Math.random() * 100); // Random number between 100 and 500
};

const Dashboard = () => {
  const colorScheme = useColorScheme();
  const [numbers, setNumbers] = useState(Array.from({ length: 15 }, getRandomNumber));
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [checkedIn, setCheckedIn] = useState(false);
  const toast = useToast();



  useEffect(() => {
    const intervalId = setInterval(() => {
      setNumbers(prevNumbers => {
        const newNumbers = [getRandomNumber(), ...prevNumbers.slice(0, 14)];
        return newNumbers;
      });
    }, 300);
    // console.log(numbers);
    setIsDarkMode(colorScheme === 'dark');
    return () => clearInterval(intervalId);
  }, []);
  
  const checkIn = () => {
    if (checkedIn === false) {
      setCheckedIn(true);
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} variant="accent" action="info">
            <ToastTitle>Check in successful. Have a productive day!</ToastTitle>
          </Toast>
        ),
      });
    } else {
      setCheckedIn(false);
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} variant="accent" action="info">
            <ToastTitle>Travel safe. Have a lovely day further!</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const backgroundColor = isDarkMode ? '#1C1C1E' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';

  return (
    <View pt="$16" px="$4" flex="$1" flexDirection="column" backgroundColor={backgroundColor}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View flexDirection="row" justifyContent="space-between">
        <View>
          <Text fontSize={wp('5%')} fontWeight="$light" color={textColor}>
            Hi Sabrina 👋
          </Text>
          <Text mt="$4" fontSize={wp('6%')} fontWeight="$bold" color={textColor}>
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
      <Card size="lg" variant="elevated" mt="$4" w="$full" h={hp('15%')} backgroundColor={cardBackgroundColor} borderRadius="$20" />
      <View display="flex" flexDirection="row" rowGap="$4" mt="$1" justifyContent="space-between">
        <Card flexDirection="$row" justifyContent="$center" alignItems="$center" variant="elevated" mt="$4" style={{ width: wp('45%'), height: hp('12%') }} backgroundColor={cardBackgroundColor} borderRadius="$20" >
          <Text color={textColor} fontSize="$5xl">45 </Text>
          <View flexDirection="$column">
          <View flexDirection="$row" alignItems="$center"><FontAwesome6 name="arrow-trend-up" size={24} color="yellowgreen" /><Text color="$yellowgreen"> 25.7%</Text></View>
          </View>
        </Card>
        <Card size="lg" variant="elevated" mt="$4" style={{ width: wp('45%'), height: hp('12%') }} backgroundColor={cardBackgroundColor} borderRadius="$20" />
      </View>
      <View flexDirection="row" justifyContent="flex-end" mt="$6" mb="$4" h="$8" alignItems="center">
        {checkedIn ? (
          <Button w={wp('36%')} borderRadius="$12" backgroundColor="lightblue" onPress={checkIn}>
            <ButtonText color="dimgrey">Check out</ButtonText>
          </Button>
        ) : (
          <Button w={wp('36%')} borderRadius="$12" backgroundColor="greenyellow" onPress={checkIn}>
            <ButtonText color="dimgrey">Check in</ButtonText>
          </Button>
        )}
      </View>
      {/* <Image
        alt="logo"
        p="$10"
        source={require('./assets/graph.png')}
        style={{ width: wp('100%'), height: hp('31%'), flexDirection: 'column', tintColor: isDarkMode ? 'white' : 'black' }}
      /> */}
      <View>
        <Text color={textColor}>Occupancy levels</Text>
        <LineChart
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        fromZero={true}
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
          width={370} // from react-native
          height={220}
          // yAxisLabel="$"
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
              borderRadius: 16
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
            borderRadius: 20
          }}
        />
      </View>
      <Navbar />
    </View>
  );
};

export default Dashboard;
