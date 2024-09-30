import React, {useRef, useState, useEffect, useCallback } from "react";
import {
  useColorScheme,
  TouchableOpacity,
  View,
  ScrollView,
  Animated
} from "react-native";
import {
  Text,
  Button,
  ButtonText,
  Spinner,
  VStack,
  HStack,
  Box,
} from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@/components/ThemeContext";
import * as Speech from "expo-speech";
import { getRecommendations, recommendOfficeTimes } from "../../services/apiservices";

const Recommendations = ({ onClose }) => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const isDarkMode = currentTheme === "dark";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    occupancyData: [],
    recommendations: null,
    officeTimesRecommendations: null,
  });
  const [currentDay, setCurrentDay] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchData();
    const days = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday',];
    setCurrentDay(days[new Date().getDay()]);
    // Start the animation when the component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recommendResponse, officeTimesResponse] = await Promise.all([
        getRecommendations(),
        recommendOfficeTimes(),
      ]);

      const newData = {
        recommendations: recommendResponse,
        officeTimesRecommendations: officeTimesResponse,
        occupancyData: officeTimesResponse.Best_Times.map(time => ({
          occupancy: time.Predicted_Class / 5, 
        })),
      };

      setData(newData);
    }
    catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching data. Please try again later.");
    }
    setLoading(false);
  };

  const getOccupancyColor = (predictedClass) => {
    const colors = ['#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF5722'];
    return colors[predictedClass - 1] || colors[0];
  };

  const generateRecommendation = useCallback(() => {
    const { officeTimesRecommendations } = data;
    if (!officeTimesRecommendations) {
      return "No recommendations available at this time. Please try again later.";
    }

    let recommendation = "Based on our analysis, here are the recommendations for office attendance:\n\n";

    if (officeTimesRecommendations.Best_Times) {
      recommendation += "Best times to go to the office:\n";
      officeTimesRecommendations.Best_Times.forEach(time => {
        recommendation += `${time.Hour}:00 - Predicted Attendance: ${time.Predicted_Attendance_Level} (${time.Recommendation})\n`;
      });
    }

    recommendation += `\nDate: ${officeTimesRecommendations.Date}\n`;
    recommendation += `Day of Week: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][officeTimesRecommendations.Day_of_Week]}\n`;

    return recommendation;
  }, [data]);

    const speakRecommendation = async () => {
      const textToSpeak = generateRecommendation();
  
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
      } else {
        setIsSpeaking(true);
        try {
          const availableVoices = await Speech.getAvailableVoicesAsync();
          const preferredVoice = availableVoices.find(
            voice => voice.quality === Speech.VoiceQuality.Enhanced
          );
  
          await Speech.speak(textToSpeak, {
            language: "en-US",
            pitch: 1.0,
            rate: 0.9,
            voice: preferredVoice ? preferredVoice.identifier : undefined,
            onDone: () => setIsSpeaking(false),
            onError: (error) => {
              console.error("Speech error:", error);
              setIsSpeaking(false);
            },
          });
        } catch (error) {
          console.error("Speech error:", error);
          setIsSpeaking(false);
        }
      }
    };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
        }}
      >
        <Spinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
        }}
      >
        <Text
          style={{
            color: isDarkMode ? "#FFFFFF" : "#000000",
            textAlign: "center",
            marginBottom: hp("2%"),
          }}
        >
          {error}
        </Text>
        <Button onPress={fetchData}>
          <ButtonText>Retry</ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <Animated.View
    style={{
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
      padding: wp("5%"),
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    }}
  >
      <ScrollView showsVerticalScrollIndicator={false}>
        <HStack
          justifyContent="space-between"
          alignItems="center"
          marginBottom={hp("2%")}
        >
          <Text
            style={{
              fontSize: wp("5.5%"),
              fontWeight: "bold",
              color: isDarkMode ? "#FFFFFF" : "#000000",
            }}
          >
            Office Recommendations
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons
              name="close"
              size={wp("6%")}
              color={isDarkMode ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
        </HStack>

        <VStack space={4}>
          <Box
            bg={isDarkMode ? "#1E1E1E" : "#F5F5F5"}
            padding={wp("4%")}
            borderRadius={wp("2.5%")}
            marginBottom={hp("2%")}
          >
            <Text
              style={{
                fontSize: wp("4.5%"),
                fontWeight: "bold",
                color: isDarkMode ? "#FFFFFF" : "#000000",
                marginBottom: hp("1%"),
              }}
            >
              OccuBot Attendance Recommendations
            </Text>
            <Text
              style={{
                color: isDarkMode ? "#FFFFFF" : "#000000",
                fontSize: wp("3.5%"),
                marginBottom: hp("1%"),
              }}
            >
              Date: {data.officeTimesRecommendations?.Date}
            </Text>
            <Text
              style={{
                color: isDarkMode ? "#FFFFFF" : "#000000",
                fontSize: wp("3.5%"),
                marginBottom: hp("2%"),
              }}
            >
              Day: {[ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'][data.officeTimesRecommendations?.Day_of_Week]}
            </Text>
            {data.officeTimesRecommendations?.Best_Times.map((time, index) => (
              <Box
                key={index}
                bg={getOccupancyColor(time.Predicted_Class)}
                padding={wp("3%")}
                borderRadius={wp("2%")}
                marginBottom={hp("1%")}
              >
                <Text
                  style={{
                    color: "#000000",
                    fontSize: wp("4%"),
                    fontWeight: "bold",
                  }}
                >
                  {time.Hour}:00
                </Text>
                <Text
                  style={{
                    color: "#000000",
                    fontSize: wp("3.5%"),
                  }}
                >
                  Predicted Attendance: {time.Predicted_Attendance_Level}
                </Text>
                <Text
                  style={{
                    color: "#000000",
                    fontSize: wp("3.5%"),
                    fontStyle: "italic",
                  }}
                >
                  {time.Recommendation}
                </Text>
              </Box>
            ))}
            <TouchableOpacity
              onPress={speakRecommendation}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: hp("2%"),
              }}
            >
              <Ionicons
                name={isSpeaking ? "volume-high" : "volume-medium"}
                size={wp("6%")}
                color={isDarkMode ? "#FFFFFF" : "#000000"}
              />
              <Text
                style={{
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                  marginLeft: wp("2%"),
                  fontSize: wp("3.5%"),
                }}
              >
                {isSpeaking ? "Stop" : "Listen to Recommendations"}
              </Text>
            </TouchableOpacity>
          </Box>
        </VStack>
      </ScrollView>
    </Animated.View>
  );
};

export default Recommendations;