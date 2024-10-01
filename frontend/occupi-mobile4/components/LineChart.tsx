import React, { useState, useEffect } from 'react';
import { useColorScheme, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { Text, Button, ButtonText, Spinner } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as Speech from 'expo-speech';
import { fetchUserTotalHoursArray, fetchUserPeakHours, getAllPeakHours } from '@/utils/analytics';
import { LineChart } from 'react-native-chart-kit'; 

const Recommendations = ({ onClose }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [activeTab, setActiveTab] = useState('days');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [occupancyData, setOccupancyData] = useState([]);
  const [peakHours, setPeakHours] = useState(null);
  const [allPeakHours, setAllPeakHours] = useState([]);

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hoursData = await fetchUserTotalHoursArray();
        const formattedData = hoursData.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-ZA', { weekday: 'short' }),
          occupancy: item.totalHours
        }));
        setOccupancyData(formattedData);

        const peakHoursData = await fetchUserPeakHours();
        setPeakHours(peakHoursData);

        const allPeakHoursData = await getAllPeakHours();
        setAllPeakHours(allPeakHoursData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const backgroundColor = isDarkMode ? 'black' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#101010' : '#F3F3F3';

  const generateRecommendation = () => {
    if (!peakHours || !allPeakHours.length) return "Loading recommendations...";

    const bestDays = allPeakHours
      .sort((a, b) => b.hours[0] - a.hours[0])
      .slice(0, 2)
      .map(day => day.weekday);

    const recommendation = `Based on the current office occupancy trends, I recommend coming to the office on ${bestDays[0]} and ${bestDays[1]}. These days tend to have higher occupancy rates, allowing for better collaboration opportunities. The peak hour on ${peakHours.weekday} is typically around ${peakHours.hour}:00.`;

    return recommendation;
  };

  const speakRecommendation = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      const textToSpeak = generateRecommendation();
      Speech.speak(textToSpeak);
      setIsSpeaking(true);
    }
  };

  const renderChart = () => (
    <LineChart
      data={{
        labels: occupancyData.map(item => item.name),
        datasets: [
          {
            data: occupancyData.map(item => item.occupancy)
          }
        ]
      }}
      width={Dimensions.get('window').width - 40}
      height={220}
      chartConfig={{
        backgroundColor: '#e26a00',
        backgroundGradientFrom: '#fb8c00',
        backgroundGradientTo: '#ffa726',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16
        },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: '#ffa726'
        }
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16
      }}
    />
  );

  const FadeInText = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(prev => prev + text[index]);
        index++;
        if (index === text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }, [text]);

    return <Text style={{ color: textColor, fontSize: wp('4%'), marginBottom: 10 }}>{displayedText}</Text>;
  };

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor, padding: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: wp('5.5%'), fontWeight: 'bold', color: textColor }}>OccuBot Recommendations</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <Button
            onPress={() => setActiveTab('days')}
            style={{ 
              backgroundColor: activeTab === 'days' ? '#007AFF' : cardBackgroundColor,
              marginRight: 10,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20
            }}
          >
            <ButtonText style={{ color: activeTab === 'days' ? 'white' : textColor }}>Days</ButtonText>
          </Button>
          <Button
            onPress={() => setActiveTab('weeks')}
            style={{ 
              backgroundColor: activeTab === 'weeks' ? '#007AFF' : cardBackgroundColor,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20
            }}
          >
            <ButtonText style={{ color: activeTab === 'weeks' ? 'white' : textColor }}>Weeks</ButtonText>
          </Button>
        </View>

        {loading ? (
          <Spinner size="large" />
        ) : (
          <>
            <View style={{ backgroundColor: cardBackgroundColor, padding: 15, borderRadius: 10, marginBottom: 20 }}>
              <FadeInText text={generateRecommendation()} />
              <TouchableOpacity onPress={speakRecommendation} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={isSpeaking ? "volume-high" : "volume-medium"} size={24} color={textColor} />
                <Text style={{ color: textColor, marginLeft: 10 }}>{isSpeaking ? 'Stop' : 'Listen'}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: cardBackgroundColor, padding: 15, borderRadius: 10 }}>
              <Text style={{ color: textColor, fontSize: wp('4%'), marginBottom: 10 }}>Office Occupancy Trend</Text>
              {renderChart()}
            </View>

            <View style={{ backgroundColor: cardBackgroundColor, padding: 15, borderRadius: 10, marginTop: 20 }}>
              <Text style={{ color: textColor, fontSize: wp('4%'), marginBottom: 10 }}>Probability of High Occupancy</Text>
              {allPeakHours.map((day, index) => (
                <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ color: textColor }}>{day.weekday}</Text>
                  <Text style={{ color: textColor }}>{((day.hours[0] / 24) * 100).toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Recommendations;
