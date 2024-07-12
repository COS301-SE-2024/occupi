import React, { useState, useEffect } from "react";
import {
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  useColorScheme,
  Alert,
  ScrollView
} from "react-native";
import {
  View,
  useToast,
  Text,
  Toast,
  ToastTitle,
  Icon,
  Box
} from '@gluestack-ui/themed';
import { Ionicons, Feather, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from 'expo-secure-store';
import GradientButton from '@/components/GradientButton';


const BookingDetails = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingInfo, setbookingInfo] = useState();
  const colorScheme = useColorScheme();
  const toast = useToast();
  const router = useRouter();
  const [creatorEmail, setCreatorEmail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const isDark = colorScheme === "dark";
  // console.log(creatorEmail + roomId + floorNo);
  // console.log(bookingInfo?);
  // console.log(startTime);
  const [attendees, setAttendees] = useState(['']);
  // console.log(attendees);
  const cardBackgroundColor = isDark ? '#2C2C2E' : '#F3F3F3';
  const steps = ["Booking details", "Invite attendees", "Receipt"];
  const apiUrl = process.env.EXPO_PUBLIC_LOCAL_API_URL;
  const bookroomendpoint = process.env.EXPO_PUBLIC_BOOK_ROOM;
  const [accentColour, setAccentColour] = useState<string>('greenyellow');

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };
    getAccentColour();
  }, []);

  useEffect(() => {
    const getbookingInfo = async () => {
      let userinfo = await SecureStore.getItemAsync('UserData');
      // console.log(result);
      // if (result !== undefined) {
      let jsoninfo = JSON.parse(userinfo);
      setCreatorEmail(jsoninfo?.data?.email);
      let result: string = await SecureStore.getItemAsync('BookingInfo');
      console.log("CurrentRoom:", jsoninfo?.data?.email);
      // setUserDetails(JSON.parse(result).data);
      let jsonresult = JSON.parse(result);
      console.log("BookingInfo", jsonresult);
      setbookingInfo(jsonresult);
      setStartTime(jsonresult.startTime);
      setEndTime(jsonresult.endTime);
      console.log(jsoninfo?.data?.email);
      setAttendees([jsoninfo?.data?.email]);
    };
    getbookingInfo();
  }, []);

  const addAttendee = () => {
    if (email && !attendees.includes(email)) {
      setAttendees([...attendees, email]);
      setEmail("");
    }
  };

  const removeAttendee = (emailToRemove) => {
    setAttendees(attendees.filter((email) => email !== emailToRemove));
  };

  const onSubmit = async () => {
    const body = {
      "roomId": bookingInfo?.roomId,
      "emails": attendees,
      "roomName": bookingInfo?.roomName,
      "creator": creatorEmail,
      "floorNo": bookingInfo?.floorNo,
      "date": `${bookingInfo?.date}T00:00:00.000+00:00`,
      "start": `${bookingInfo?.date}T${startTime}:00.000+00:00`,
      "end": `${bookingInfo?.date}T${endTime}:00.000+00:00`
    };
    console.log("hereeeeee", body);
    let authToken = await SecureStore.getItemAsync('Token');
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}${bookroomendpoint}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `${authToken}`
        },
        body: JSON.stringify(body),
        credentials: "include"
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setCurrentStep(2);
        setLoading(false);
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={String(id)} variant="accent" action="success">
                <ToastTitle>{data.message}</ToastTitle>
              </Toast>
            );
          },
        });
      } else {
        console.log(data);
        setLoading(false);
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={String(id)} variant="accent" action="error">
                <ToastTitle>{data.message}</ToastTitle>
              </Toast>
            );
          },
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // setResponse('An error occurred');
    }
    // }, 3000);
  };

  const renderAttendee = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        margin: 5,
        backgroundColor: isDark ? '#2C2C2E' : '#F3F3F3',
        borderRadius: 20
      }}
    >
      <Ionicons
        name="person-outline"
        size={25}
        color={isDark ? "#fff" : "#000"}
      />
      <Text
        style={{
          flex: 1,
          marginLeft: 10,
          color: isDark ? "#fff" : "#000",
        }}
      >
        {item}
      </Text>
      <TouchableOpacity onPress={() => removeAttendee(item)}>
        <Ionicons name="close" size={25} color={isDark ? "#fff" : "#000"} />
      </TouchableOpacity>
    </View>
  );

  const StepIndicator = () => (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}
    >
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={{
            alignItems: 'center'
          }}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: index <= currentStep ? `${accentColour}` : (isDark ? "#333" : "#E0E0E0"),
              }}
            >
            </View>
            <Text
              style={{
                color:
                  currentStep === index
                    ? `${accentColour}`
                    : isDark
                      ? "#fff"
                      : "#000",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {step}
            </Text>
          </View>

          {index < steps.length - 1 && (
            <View
              style={{
                height: 2,
                backgroundColor:
                  currentStep >= index + 1
                    ? `${accentColour}`
                    : isDark
                      ? "#333"
                      : "#E0E0E0",
                flex: 1,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert(
        "Biometric Authentication not available",
        "Your device does not support biometric authentication or it is not set up. Please use your PIN to confirm the booking."
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm your booking",
      fallbackLabel: "Use PIN",
    });

    if (result.success) {
      setCurrentStep(1);
    } else {
      Alert.alert(
        "Authentication failed",
        "Biometric authentication failed. Please try again."
      );
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#000" : "#fff",
        paddingTop: 50
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 15,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon as={Feather} name="chevron-left" size="xl" color={colorScheme === 'dark' ? 'white' : 'black'} onPress={() => router.back()} />
        </TouchableOpacity>
        {/* <Feather name="calendar" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} /> */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 90,
            color: isDark ? "#fff" : "#000",
          }}
        >
          {steps[currentStep]}
        </Text>
      </View>

      <StepIndicator />

      {currentStep === 0 && (
        <View>
          <Image
            source={{
              uri: "https://fancyhouse-design.com/wp-content/uploads/2023/11/With-a-backdrop-of-Dubais-cityscape-the-office-interior-design-is-as-dynamic-as-it-is-luxurious..jpg",
            }}
            style={{ width: "100%", height: 400, borderRadius: 20 }}
          />
          <View style={{ padding: 15 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: isDark ? "#fff" : "#000",
              }}
            >
              {bookingInfo?.roomName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Ionicons name="wifi" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}> Fast   </Text>
              <MaterialCommunityIcons name="television" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}> OLED   </Text>
              <Octicons name="people" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}>{bookingInfo?.minOccupancy} - {bookingInfo?.maxOccupancy}   </Text>
              <Feather name="layers" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}> Floor: {bookingInfo?.floorNo === "0" ? 'G' : bookingInfo?.floorNo}</Text>

            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <View
                style={{
                  borderRadius: 8,
                  backgroundColor: isDark ? "#333" : "lightgrey",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    padding: 6,
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  Check in: {startTime}
                </Text>
              </View>
              <View
                style={{
                  borderRadius: 8,
                  backgroundColor: isDark ? "#333" : "lightgrey",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    padding: 6,
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  Check out: {endTime}
                </Text>
              </View>
            </View>
          </View>
          <GradientButton
            onPress={() => handleBiometricAuth()}
            text="Confirm booking"
          />
        </View>
      )}

      {currentStep === 1 && (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", margin: 15, alignItems: "center" }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#E0E0E0",
                borderRadius: 12,
                padding: 10,
                marginRight: 10,
                color: isDark ? "#fff" : "#000",
              }}
              placeholder="Enter attendee's email or employee id"
              placeholderTextColor={isDark ? "#999" : "#666"}
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              onPress={addAttendee}
              style={{
                backgroundColor: `${accentColour}`,
                width: 40,
                height: 40,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="add" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 14,
              marginLeft: 15,
              marginBottom: 10,
              color: isDark ? "#fff" : "#000",
            }}
          >
            These employees will receive emails
          </Text>


          <FlatList
            data={attendees}
            renderItem={renderAttendee}
            keyExtractor={(item) => item}
            style={{
              marginHorizontal: 15,
              borderRadius: 10,


            }}
          />

          {!loading ? (
            <GradientButton
              onPress={() => onSubmit()}
              text="Send invites"
            />
          ) : (
            <TouchableOpacity
              style={{ margin: 15, borderRadius: 15 }}
              onPress={() => onSubmit()}
            >
              <LinearGradient
                colors={["#614DC8", "#86EBCC", "#B2FC3A", "#EEF060"]}
                locations={[0.02, 0.31, 0.67, 0.97]}
                start={[0, 1]}
                end={[1, 0]}
                style={{
                  padding: 15,
                  alignItems: "center",
                  borderRadius: 15,
                }}
              >
                <View>
                  <ActivityIndicator size="small" color="#000" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => onSubmit()}>
            <Text
              style={{
                color: `${accentColour}`,
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Skip this step
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {currentStep === 2 && (
        <View style={{ paddingHorizontal: 15, flex: 1 }}>
          {/* <Text
            style={{
              fontSize: 16,
              color: isDark ? "#fff" : "#000",
            }}
          > */}
          <View style={{ width: 365, height: 500, borderWidth: 1, borderColor: cardBackgroundColor, paddingBottom: 50, borderRadius: 12, backgroundColor: cardBackgroundColor, marginHorizontal: 4 }}>
            <Image style={{ width: '100%', height: '30%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
            <Text fontWeight="$bold" m="$3" style={{ color: isDark ? '#fff' : '#000', fontSize: 24 }}>{bookingInfo?.roomName}</Text>
            <View px="$3" alignItems="center" flexDirection="row">
              <Ionicons name="wifi" size={24} color={isDark ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDark ? '#fff' : '#000'}> Fast   </Text>
              <MaterialCommunityIcons name="television" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}> OLED   </Text>
              <Octicons name="people" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}>{bookingInfo?.minOccupancy} - {bookingInfo?.maxOccupancy}   </Text>
              <Feather name="layers" size={24} color={isDark ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDark ? '#fff' : '#000'}> Floor {bookingInfo?.floorNo === "0" ? 'G' : bookingInfo?.floorNo}</Text>
            </View>
            <View px="$3" flexDirection="row" justifyContent="space-around">
              <View alignItems="center" my="$3" px="$1" py="$1.5" w="$2/5" backgroundColor="$yellowgreen" borderRadius="$lg">
                <Text color={isDark ? '#000' : '#fff'}>Check in: {startTime}</Text>
              </View>
              <View alignItems="center" my="$3" px="$1" py="$1.5" w="$2/5" backgroundColor="$#FF5F5F" borderRadius="$lg">
                <Text color={isDark ? '#000' : '#fff'}>Check out: {endTime}</Text>
              </View>
            </View>
            <View mt="$1" flexDirection="row" alignItems="center" right="$6">
              <Box backgroundColor={isDark ? '#000' : '#fff'} h="$10" borderRadius="$lg" w="$10" />
              <Text color={isDark ? '#000' : '#fff'}>----------------------------------------------</Text>
              <Box backgroundColor={isDark ? '#000' : '#fff'} h="$10" borderRadius="$lg" w="$10" />
            </View>
            <View px="$4" py="$2">
              <View flexDirection="row" alignItems="center">
                <Octicons name="people" size={24} color={isDark ? '#fff' : '#000'} />
                <Text color={isDark ? '#fff' : '#000'} style={{ fontSize: 20 }}> Attendees:</Text>
              </View>
              <ScrollView style={{ height: 70 }}>
                {attendees.map((email, idx) => (
                  <Text color={isDark ? '#fff' : '#000'}>{idx + 1}. {email}</Text>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity
              style={{ margin: 15, borderRadius: 25 }}
            >
              <LinearGradient
                colors={["#614DC8", "#86EBCC", "#B2FC3A", "#EEF060"]}
                locations={[0.02, 0.31, 0.67, 0.97]}
                start={[0, 1]}
                end={[1, 0]}
                style={{
                  padding: 15,
                  alignItems: "center",
                  borderRadius: 15,
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#000" : "#fff",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Download PDF
                </Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
          {/* </Text> */}
          <TouchableOpacity style={{ paddingHorizontal: 0, marginBottom: 50 }} onPress={() => router.push('/home')}>
            <View flexDirection="row" mt="$8" borderRadius="$lg" alignItems="center" justifyContent="center" backgroundColor={isDark ? '#2C2C2E' : '#F3F3F3'} h="$11">
              <Text fontWeight="$bold" color="black">Home</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookingDetails;
