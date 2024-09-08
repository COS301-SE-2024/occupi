import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';

const Stats = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const [isDarkMode, setIsDarkMode] = useState(currentTheme === 'dark');
  const [accentColour, setAccentColour] = useState<string>('greenyellow');

  const [summary, setSummary] = useState('');

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      // Fetch data and generate summary
      // ...
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    }
  };

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
    { title: 'Your Peak Office Hours', color: '#101010', border: accentColour },
    { title: 'Arrival & Departure Times', color: '#101010', border: accentColour },
    { title: 'Productivity Trends', color: '#101010', border: accentColour },
    { title: 'Team Collaboration Metrics', color: '#101010', border: accentColour },
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

        {analyticsCards.map((item, index) => (
          <View key={index} style={{
            backgroundColor: item.color,
            borderRadius: wp('4%'),
            padding: wp('4%'),
            marginBottom: hp('3%'),
            borderColor: item.border,
            borderWidth: 2,
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: 'white',
              marginBottom: hp('2%'),
            }}>{item.title}</Text>
          </View>
        ))}

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