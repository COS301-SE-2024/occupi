import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import LineGraph from '@/components/LineGraph';
import BarGraph from '@/components/BarGraph';
import { LinearGradient } from 'expo-linear-gradient';
import {Video} from 'expo-av';
import { Image } from 'react-native';
import { router } from 'expo-router';
// import PieChart from '@/components/PieChart';

const Stats = () => {
  const navigation = useNavigation();
  const [userHours, setUserHours] = useState(null);
  const [userAverageHours, setUserAverageHours] = useState(null);
  const [userWorkRatio, setUserWorkRatio] = useState(null);
  const [userPeakOfficeHours, setUserPeakOfficeHours] = useState(null);
  const [userArrivalDepartureAverage, setUserArrivalDepartureAverage] = useState(null);
  const [userInOfficeRate, setUserInOfficeRate] = useState(null);
  const [mostActiveEmployee, setMostActiveEmployee] = useState(null);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      const [hours, avgHours, workRatio, peakHours, arrivalDeparture, inOfficeRate, mostActive] = await Promise.all([
        fetch('/analytics/user-hours').then(res => res.json()),
        fetch('/analytics/user-average-hours').then(res => res.json()),
        fetch('/analytics/user-work-ratio').then(res => res.json()),
        fetch('/analytics/user-peak-office-hours').then(res => res.json()),
        fetch('/analytics/user-arrival-departure-average').then(res => res.json()),
        fetch('/analytics/user-in-office-rate').then(res => res.json()),
        fetch('/analytics/most-active-employee').then(res => res.json()),
      ]);

      setUserHours(hours.data);
      setUserAverageHours(avgHours.data);
      setUserWorkRatio(workRatio.data);
      setUserPeakOfficeHours(peakHours.data);
      setUserArrivalDepartureAverage(arrivalDeparture.data);
      setUserInOfficeRate(inOfficeRate.data);
      setMostActiveEmployee(mostActive);

      // Generate personalized summary
      generateSummary(hours.data, avgHours.data, workRatio.data, inOfficeRate.data, mostActive);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    }
  };

  const generateSummary = (hours, avgHours, workRatio, inOfficeRate, mostActive) => {
    const totalHours = hours.reduce((sum, day) => sum + day.value, 0);
    const avgWorkRatio = workRatio.reduce((sum, day) => sum + day.value, 0) / workRatio.length;
    const avgInOfficeRate = inOfficeRate.reduce((sum, day) => sum + day.value, 0) / inOfficeRate.length;

    let summary = `Over the past ${hours.length} days, you've worked a total of ${totalHours.toFixed(1)} hours, `;
    summary += `with an average of ${(totalHours / hours.length).toFixed(1)} hours per day. `;
    summary += `Your work ratio is ${avgWorkRatio.toFixed(2)}, indicating a ${avgWorkRatio > 0.7 ? 'high' : 'moderate'} level of productivity. `;
    summary += `You've been in the office ${(avgInOfficeRate * 100).toFixed(1)}% of the time. `;
    
    if (mostActive.email === 'your.email@example.com') {
      summary += "Congratulations! You're currently the most active employee in the office!";
    } else {
      summary += `The most active employee is ${mostActive.email} with an average of ${mostActive.averageHours.toFixed(1)} hours per day.`;
    }

    setSummary(summary);
  };

  return (

    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF']}
      style={{
        flex: 1,
        borderRadius: wp('5%'),
        padding: wp('5%'),
        justifyContent: 'space-between',
      }}
    >
        {/* <Image
          source={require('../../screens/Dashboard/assets/ce8f784a-89c7-4272-9e41-06fb784f0dda.jpeg')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          
          }}
        /> */}
   
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: hp('5%'),
          left: wp('5%'),
          zIndex: 1,
        }}
        onPress={() =>  router.replace('home')}
      >
        <Ionicons name="arrow-back" size={24} color="black"
        style = {{
          padding: wp('3%'),
          borderRadius: wp('4%'),
          marginBottom: hp('3%'),
        }} />
      </TouchableOpacity>

      <Text style={{
        fontSize: wp('6%'),
        fontWeight: 'bold',
        color: 'black',
        marginTop: hp('8%'),
        marginBottom: hp('1%'),
      }}>
        AI Analyser
      </Text>
      <Text style={{
        fontSize: wp('4%'),
        color: '#888',
        marginBottom: hp('2%'),
      }}>
        Process Personalization
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: '#E1E1E1',
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
          
        }}>
          <Text style={{
            fontSize: wp('4.5%'),
            fontWeight: 'bold',
            color: 'black',
            marginBottom: hp('1%'),
          }}>
            Your Performance Summary
          </Text>
          <Text style={{ color: 'white', fontSize: wp('3.5%') }}>
            {summary}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            marginBottom: hp('3%'),
          }}
        >
          <View style={{
            backgroundColor: '#F4B732',
            borderRadius: wp('4%'),
            padding: wp('4%'),
            marginRight: wp('4%'),
            width: wp('70%'),
            overflow: 'hidden',
            alignItems: 'center',
          
          }}>
            <Text style={{
              fontSize: wp('4.5%'),
              fontWeight: 'bold',
              color: 'white',
              marginBottom: hp('1%'),
            }}>
              Daily Progress
            </Text>
            {userHours && <BarGraph data={userHours} />}
          </View>

          <View style={{
            backgroundColor: '#91EAE4',
            borderRadius: wp('4%'),
            padding: wp('4%'),
            marginRight: wp('4%'),
            width: wp('70%'),
            overflow: 'hidden',
            alignItems: 'center',
          
          }}>
            <Text style={{
              fontSize: wp('4.5%'),
              fontWeight: 'bold',
              color: 'white',
              marginBottom: hp('1%'),
            }}>
              Average Hours
            </Text>
            {userAverageHours && <LineGraph data={userAverageHours} />}
          </View>

          <View style={{
            backgroundColor: '#C6F432',
            borderRadius: wp('4%'),
            padding: wp('4%'),
            marginRight: wp('4%'),
            width: wp('70%'),
            overflow: 'hidden',
            alignItems: 'center',
          
          }}>
            <Text style={{
              fontSize: wp('4.5%'),
              fontWeight: 'bold',
              color: 'white',
              marginBottom: hp('1%'),
            }}>
              Work Ratio
            </Text>
            {/* {userWorkRatio && <PieChart data={userWorkRatio} />} */}
          </View>

          <View style={{
            backgroundColor: '#F45632',
            borderRadius: wp('4%'),
            padding: wp('4%'),
            marginRight: wp('4%'),
            width: wp('70%'),
            overflow: 'hidden',
            alignItems: 'center',
          
          }}>
            <Text style={{
              fontSize: wp('4.5%'),
              fontWeight: 'bold',
              color: 'white',
              marginBottom: hp('1%'),
            }}>
              In-Office Rate
            </Text>
            {userInOfficeRate && <LineGraph data={userInOfficeRate} />}
          </View>
        </ScrollView>

        <View style={{
          backgroundColor: '#FF9898',
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
        
        }}>
          <Text style={{
            fontSize: wp('5%'),
            fontWeight: 'bold',
            color: 'white',
            marginBottom: hp('2%'),
          }}>
            Your Peak Office Hours
          </Text>
          {userPeakOfficeHours && <BarGraph data={userPeakOfficeHours} />}
        </View>

        <View style={{
          backgroundColor: '#E61D8C',
          borderRadius: wp('4%'),
          padding: wp('4%'),
          marginBottom: hp('3%'),
        
        }}>
          <Text style={{
            fontSize: wp('5%'),
            fontWeight: 'bold',
            color: 'white',
            marginBottom: hp('2%'),
          }}>
            Arrival & Departure Times
          </Text>
          {userArrivalDepartureAverage && <LineGraph data={userArrivalDepartureAverage} />}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Stats;