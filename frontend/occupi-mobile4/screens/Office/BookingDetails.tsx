import React, { useState } from "react";
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

const getTimeForSlot = (slot) => {
  console.log(slot);
  let startTime, endTime;
  switch (slot) {
    case 1:
      startTime = '07:00';
      endTime = '08:00';
      break;
    case 2:
      startTime = '08:00';
      endTime = '09:00';
      break;
    case 3:
      startTime = '09:00';
      endTime = '10:00';
      break;
    case 4:
      startTime = '10:00';
      endTime = '11:00';
      break;
    case 5:
      startTime = '11:00';
      endTime = '12:00';
      break;
    case 6:
      startTime = '12:00';
      endTime = '13:00';
      break;
    case 7:
      startTime = '13:00';
      endTime = '14:00';
      break;
    case 8:
      startTime = '14:00';
      endTime = '15:00';
      break;
    case 9:
      startTime = '15:00';
      endTime = '16:00';
      break;
    case 10:
      startTime = '16:00';
      endTime = '17:00';
      break;
    default:
      startTime = 'Invalid slot';
      endTime = 'Invalid slot';
  }
  return { startTime, endTime };
};

const BookingDetails = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const toast = useToast();
  const router = useRouter();
  const roomParams = useLocalSearchParams();
  const creatorEmail = roomParams.email;
  const slot = roomParams.slot || 0;
  const { startTime, endTime } = getTimeForSlot(Number(roomParams.slot));
  const roomId = roomParams.roomId;
  const floorNo = roomParams.floorNo;
  const roomData = JSON.parse(roomParams.roomData);
  const isDark = colorScheme === "dark";
  console.log(creatorEmail + slot + roomId + floorNo);
  console.log(roomData);
  console.log("slot: " + slot);
  console.log(startTime);
  const [attendees, setAttendees] = useState([creatorEmail]);
  console.log(attendees);
  const cardBackgroundColor = isDark ? '#2C2C2E' : '#F3F3F3';

  const steps = ["Booking details", "Invite attendees", "Receipt"];

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
      "roomId": roomParams.roomId,
      "slot": parseInt(roomParams.slot, 10),
      "emails": attendees,
      "roomName": roomData.roomName,
      "creator": creatorEmail,
      "floorNo": parseInt(roomParams.floorNo, 10)
    };
    console.log(body);
    try {
      setLoading(true);
      const response = await fetch('https://dev.occupi.tech/api/book-room', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        credentials: "include"
      });
      const data = await response.json();
      console.log(data);
      const cookies = response.headers.get('Accept');
      // CookieManager.get('https://dev.occupi.tech')
      //   .then((cookies) => {
      //     console.log('CookieManager.get =>', cookies);
      //   });
      console.log(cookies);
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
                backgroundColor: index <= currentStep ? "greenyellow" : (isDark ? "#333" : "#E0E0E0"),
              }}
            >
            </View>
            <Text
              style={{
                color:
                  currentStep === index
                    ? "greenyellow"
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
                    ? "greenyellow"
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
              {roomData.roomName}
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
              <Octicons name="people" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}> {roomData.minOccupancy} - {roomData.maxOccupancy} </Text>
              <Feather name="layers" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}> Floor: {roomData.floorNo === 0 ? 'G' : roomData.floorNo}</Text>

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
          <TouchableOpacity
            style={{ margin: 15, borderRadius: 25 }}
            onPress={handleBiometricAuth}
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
                Confirm booking
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
                backgroundColor: "greenyellow",
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

          {!loading ? (<TouchableOpacity
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
              <Text
                style={{
                  color: isDark ? '#000' : '#fff',
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Send invites
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
                color: "greenyellow",
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
          <View style={{ width: 365, height:500, borderWidth: 1, borderColor: cardBackgroundColor, paddingBottom:50, borderRadius: 12, backgroundColor: cardBackgroundColor, marginHorizontal: 4 }}>
            <Image style={{ width: '100%', height: '30%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
            <Text fontWeight="$bold" m="$3" style={{ color: isDark ? '#fff' : '#000', fontSize: 24 }}>HDMI Room</Text>
            <View px="$3" alignItems="center" flexDirection="row">
              <Ionicons name="wifi" size={24} color={isDark ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDark ? '#fff' : '#000'}> Fast   </Text>
              <MaterialCommunityIcons name="television" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}> OLED   </Text>
              <Octicons name="people" size={24} color={isDark ? '#fff' : '#000'} /><Text color={isDark ? '#fff' : '#000'}> {roomData.minOccupancy} - {roomData.maxOccupancy} </Text>
              <Feather name="layers" size={24} color={isDark ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDark ? '#fff' : '#000'}> Floor {roomData.floorNo === 0 ? 'G' : roomData.floorNo}</Text>
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
              <ScrollView style={{height:70}}>
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
