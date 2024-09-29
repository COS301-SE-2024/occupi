import React, { useState, useEffect, useCallback } from 'react';
import { useColorScheme, TouchableOpacity, View, ScrollView } from 'react-native';
import { Text, Button, ButtonText, Spinner, VStack, HStack } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '@/components/ThemeContext';
import * as Speech from 'expo-speech';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { getRecommendations, recommendOfficeTimes, predictDay, predictHourly } from '../../services/apiservices';
import OccupancyModel from '@/components/OccupancyModel';

const Recommendations = ({ onClose }) => {
    const colorScheme = useColorScheme();
    const { theme } = useTheme();
    const currentTheme = theme === "system" ? colorScheme : theme;
    const isDarkMode = currentTheme === 'dark';
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
      occupancyData: [],
      recommendations: null,
      officeTimesRecommendations: null,
      predictedOccupancy: null,
      hourlyPredictions: [],
    });
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [recommendResponse, officeTimesResponse, predictDayResponse, ...hourlyPredictions] = await Promise.all([
        getRecommendations(),
        recommendOfficeTimes(),
        predictDay(today, 6, 17),
        ...Array.from({ length: 12 }, (_, i) => predictHourly(today, i + 6)), // Predict for hours 6-17
      ]);

      const formattedData = Object.entries(predictDayResponse.data || {}).map(([hour, occupancy]) => ({
        name: `${hour}:00`,
        occupancy: occupancy,
      }));

      const hourlyData = hourlyPredictions.map((prediction, index) => ({
        hour: index + 6,
        occupancy: prediction.data,
      }));

      setData({
        occupancyData: formattedData,
        recommendations: recommendResponse.data,
        officeTimesRecommendations: officeTimesResponse.data,
        predictedOccupancy: predictDayResponse.data,
        hourlyPredictions: hourlyData,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const generateRecommendation = useCallback(() => {
    const { recommendations, officeTimesRecommendations, hourlyPredictions } = data;
    if (!recommendations || !officeTimesRecommendations || !hourlyPredictions.length) return "Loading recommendations...";

    const lowOccupancyHours = hourlyPredictions
      .filter(pred => pred.occupancy < 0.4)
      .map(pred => `${pred.hour}:00`)
      .join(', ');

    const highOccupancyHours = hourlyPredictions
      .filter(pred => pred.occupancy > 0.7)
      .map(pred => `${pred.hour}:00`)
      .join(', ');

    return `Based on our analysis, here are the recommendations for office attendance:

    Today's recommendation: ${recommendations.today_recommendation || 'Not available'}

    Best office time: ${officeTimesRecommendations.best_time || 'Not available'}

    Low occupancy hours (recommended): ${lowOccupancyHours || 'None'}

    High occupancy hours (avoid if possible): ${highOccupancyHours || 'None'}

    Best days this week: ${officeTimesRecommendations.best_days ? officeTimesRecommendations.best_days.join(', ') : 'Not available'}

    Week recommendation: ${recommendations.week_recommendation || 'Not available'}

    Future outlook: ${recommendations.future_recommendation || 'Not available'}

    Upcoming busy weeks: ${officeTimesRecommendations.busy_weeks ? officeTimesRecommendations.busy_weeks.join(', ') : 'Not available'}`;
  }, [data]);


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

  const renderOccupancyLevel = (occupancy) => {
    const level = getOccupancyLevel(occupancy);
    return (
      <HStack justifyContent="space-between" alignItems="center">
        <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', fontSize: wp('3.5%') }}>Level {level}</Text>
        <View style={{ width: wp('5%'), height: wp('5%'), borderRadius: wp('2.5%'), backgroundColor: getLevelColor(level) }} />
      </HStack>
    );
  };

  const pieChartData = data.occupancyData.map((item) => ({
    name: item.name,
    population: item.occupancy * 100,
    color: getLevelColor(getOccupancyLevel(item.occupancy)),
    legendFontColor: isDarkMode ? '#FFFFFF' : '#000000',
    legendFontSize: wp('3%'),
  }));

  const renderOccupancyChart = () => (
    <LineChart
      data={{
        labels: data.hourlyPredictions.map(pred => `${pred.hour}:00`),
        datasets: [{
          data: data.hourlyPredictions.map(pred => pred.occupancy)
        }]
      }}
      width={wp('90%')}
      height={220}
      yAxisLabel=""
      yAxisSuffix=""
      yAxisInterval={1}
      chartConfig={{
        backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
        backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#F5F5F5',
        backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#F5F5F5',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255,' : '0, 0, 0,'} ${opacity})`,
        labelColor: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255,' : '0, 0, 0,'} ${opacity})`,
        style: {
          borderRadius: 16
        },
        propsForDots: {
          r: "6",
          strokeWidth: "2",
          stroke: isDarkMode ? "#ffa726" : "#ff6384"
        }
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16
      }}
    />
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#FFFFFF', padding: wp('5%') }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HStack justifyContent="space-between" alignItems="center" marginBottom={hp('2%')}>
          <Text style={{ fontSize: wp('5.5%'), fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#000000' }}>Office Recommendations</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={wp('6%')} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </HStack>

        <VStack space={4}>
          <View style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5', padding: wp('4%'), borderRadius: wp('2.5%'), marginBottom: hp('2%') }}>
            <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', fontSize: wp('4%') }}>{generateRecommendation()}</Text>
            <TouchableOpacity onPress={speakRecommendation} style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp('1%') }}>
              <Ionicons name={isSpeaking ? "volume-high" : "volume-medium"} size={wp('6%')} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', marginLeft: wp('2%'), fontSize: wp('3.5%') }}>{isSpeaking ? 'Stop' : 'Listen'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5', padding: wp('4%'), borderRadius: wp('2.5%'), marginBottom: hp('2%') }}>
            <Text style={{ fontSize: wp('4%'), fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#000000', marginBottom: hp('1%') }}>Hourly Occupancy Prediction</Text>
            {renderOccupancyChart()}
          </View>

          <View style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5', padding: wp('4%'), borderRadius: wp('2.5%'), marginBottom: hp('2%') }}>
            <Text style={{ fontSize: wp('4%'), fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#000000', marginBottom: hp('1%') }}>Office Occupancy</Text>
            <PieChart
              data={pieChartData}
              width={wp('85%')}
              height={hp('30%')}
              chartConfig={{
                backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255,' : '0, 0, 0,'} ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          <View style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5', padding: wp('4%'), borderRadius: wp('2.5%'), marginBottom: hp('2%') }}>
            <Text style={{ fontSize: wp('4%'), fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#000000', marginBottom: hp('1%') }}>3D Office Model</Text>
            <OccupancyModel occupancyData={data.occupancyData} />
          </View>

          <View style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5', padding: wp('4%'), borderRadius: wp('2.5%'), marginBottom: hp('2%') }}>
            <Text style={{ fontSize: wp('4%'), fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#000000', marginBottom: hp('1%') }}>Hourly Occupancy Levels</Text>
            {data.occupancyData.map((item, index) => (
              <HStack key={index} justifyContent="space-between" alignItems="center" marginBottom={hp('1%')}>
                <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', fontSize: wp('3.5%') }}>{item.name}</Text>
                {renderOccupancyLevel(item.occupancy)}
              </HStack>
            ))}
          </View>
        </VStack>
      </ScrollView>
    </View>
  );
};

export default Recommendations;