import React, { useState, useEffect, useCallback } from 'react';
import { useColorScheme, TouchableOpacity, View, ScrollView } from 'react-native';
import { Text, Button, ButtonText, Spinner, VStack, HStack } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '@/components/ThemeContext';
import * as Speech from 'expo-speech';
import { PieChart } from 'react-native-chart-kit';
import { getRecommendations, recommendOfficeTimes, predictDay } from '@/services/apiservices'; 

const Recommendations = ({ onClose }) => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const isDarkMode = currentTheme === 'dark';
  const [activeTab, setActiveTab] = useState('today');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    occupancyData: [],
    recommendations: null,
    officeTimesRecommendations: null,
    predictedOccupancy: null,
  });

  const styles = getStyles(isDarkMode);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recommendResponse, officeTimesResponse, predictDayResponse] = await Promise.all([
        getRecommendations(),
        recommendOfficeTimes(),
        predictDay(new Date().toISOString().split('T')[0], 6, 17),
      ]);

      if (recommendResponse.status === 'success' && officeTimesResponse.status === 'success' && predictDayResponse.status === 'success') {
        const formattedData = Object.entries(predictDayResponse.data).map(([hour, occupancy]) => ({
          name: `${hour}:00`,
          occupancy: occupancy,
        }));

        setData({
          occupancyData: formattedData,
          recommendations: recommendResponse.data,
          officeTimesRecommendations: officeTimesResponse.data,
          predictedOccupancy: predictDayResponse.data,
        });
      } else {
        console.error('Error in one of the API responses');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const generateRecommendation = useCallback(() => {
    const { recommendations, officeTimesRecommendations } = data;
    if (!recommendations || !officeTimesRecommendations) return "Loading recommendations...";

    const recommendationMap = {
      today: `${recommendations.today_recommendation || ''}\n\nBest office time: ${officeTimesRecommendations.best_time || 'Not available'}`,
      week: `${recommendations.week_recommendation || ''}\n\nBest days this week: ${officeTimesRecommendations.best_days ? officeTimesRecommendations.best_days.join(', ') : 'Not available'}`,
      future: `${recommendations.future_recommendation || ''}\n\nUpcoming busy weeks: ${officeTimesRecommendations.busy_weeks ? officeTimesRecommendations.busy_weeks.join(', ') : 'Not available'}`,
    };

    return recommendationMap[activeTab] || "No recommendation available.";
  }, [data, activeTab]);

  const speakRecommendation = async () => {
    const textToSpeak = generateRecommendation();
    
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      try {
        await Speech.speak(textToSpeak, {
          language: 'en-US',
          voice: 'com.apple.ttsbundle.Samantha-compact',
          pitch: 1.1,
          rate: 0.9,
          onDone: () => setIsSpeaking(false),
          onError: (error) => {
            console.error('Speech error:', error);
            setIsSpeaking(false);
          },
        });
      } catch (error) {
        console.error('Speech error:', error);
        setIsSpeaking(false);
      }
    }
  };

  const renderOccupancyLevel = (occupancy) => {
    const level = getOccupancyLevel(occupancy);
    return (
      <HStack justifyContent="space-between" alignItems="center">
        <Text style={styles.occupancyText}>Level {level}</Text>
        <View style={[styles.occupancyIndicator, { backgroundColor: getLevelColor(level) }]} />
      </HStack>
    );
  };

  const pieChartData = data.occupancyData.map((item) => ({
    name: item.name,
    population: item.occupancy * 100,
    color: getLevelColor(getOccupancyLevel(item.occupancy)),
    legendFontColor: styles.text.color,
    legendFontSize: wp('3%'),
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HStack justifyContent="space-between" alignItems="center" marginBottom={hp('2%')}>
          <Text style={styles.title}>Office Occupancy</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={wp('6%')} color={styles.text.color} />
          </TouchableOpacity>
        </HStack>

        <HStack marginBottom={hp('2%')} justifyContent="space-between">
          {['today', 'week', 'future'].map((tab) => (
            <Button
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            >
              <ButtonText style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ButtonText>
            </Button>
          ))}
        </HStack>

        <VStack space={4}>
          <View style={styles.card}>
            <Text style={styles.cardText}>{generateRecommendation()}</Text>
            <TouchableOpacity onPress={speakRecommendation} style={styles.speakButton}>
              <Ionicons name={isSpeaking ? "volume-high" : "volume-medium"} size={wp('6%')} color={styles.text.color} />
              <Text style={styles.speakButtonText}>{isSpeaking ? 'Stop' : 'Listen'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Occupancy</Text>
            <PieChart
              data={pieChartData}
              width={wp('85%')}
              height={hp('30%')}
              chartConfig={{
                backgroundColor: styles.card.backgroundColor,
                backgroundGradientFrom: styles.card.backgroundColor,
                backgroundGradientTo: styles.card.backgroundColor,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hourly Occupancy Levels</Text>
            {data.occupancyData.map((item, index) => (
              <HStack key={index} justifyContent="space-between" alignItems="center" marginBottom={hp('1%')}>
                <Text style={styles.occupancyText}>{item.name}</Text>
                {renderOccupancyLevel(item.occupancy)}
              </HStack>
            ))}
          </View>
        </VStack>
      </ScrollView>
    </View>
  );
};

const getStyles = (isDarkMode) => ({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
    padding: wp('5%'),
  },
  title: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  text: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  card: {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
    padding: wp('4%'),
    borderRadius: wp('2.5%'),
    marginBottom: hp('2%'),
  },
  cardTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: isDarkMode ? '#FFFFFF' : '#000000',
    marginBottom: hp('1%'),
  },
  cardText: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: wp('4%'),
  },
  tabButton: {
    backgroundColor: isDarkMode ? '#2C2C2C' : '#E0E0E0',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('5%'),
    flex: 1,
    marginHorizontal: wp('1%'),
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: wp('3%'),
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  speakButtonText: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    marginLeft: wp('2%'),
    fontSize: wp('3.5%'),
  },
  occupancyText: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: wp('3.5%'),
  },
  occupancyIndicator: {
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
  },
});

const getOccupancyLevel = (occupancy) => {
  if (occupancy >= 0.8) return 5;
  if (occupancy >= 0.6) return 4;
  if (occupancy >= 0.4) return 3;
  if (occupancy >= 0.2) return 2;
  return 1;
};

const getLevelColor = (level) => {
  const colors = ['#008000', '#90EE90', '#FFFF00', '#FFA500', '#FF0000'];
  return colors[level - 1] || colors[0];
};

export default Recommendations;
