import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  useColorScheme,
  Alert,
} from "react-native";
import {
  useToast,
  Toast,
  ToastTitle
} from '@gluestack-ui/themed';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from "expo-local-authentication";

const BookingDetails = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [attendees, setAttendees] = useState([]);
  const [email, setEmail] = useState("");
  const colorScheme = useColorScheme();
  const toast = useToast();
  const router = useRouter();
  const roomParams = useLocalSearchParams();
  const creatorEmail = roomParams.email;
  const slot = roomParams.slot;
  const roomId = roomParams.roomId;
  const floorNo = roomParams.floorNo;
  const roomData = JSON.parse(roomParams.roomData);
  const isDark = colorScheme === "dark";
  // console.log(creatorEmail + slot + roomId + floorNo);
  // console.log(roomData);
  console.log(attendees);

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
      "emails" : attendees,
      "roomName" : roomData.roomName,
      "creator" : creatorEmail,
      "floorNo" : parseInt(roomParams.floorNo, 10)
    };
    console.log(body);
    try {
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
      const cookies = response.headers.get('Accept');
      // CookieManager.get('https://dev.occupi.tech')
      //   .then((cookies) => {
      //     console.log('CookieManager.get =>', cookies);
      //   });
      console.log(cookies);
      if (response.ok) {
        setCurrentStep(2)
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="success">
                <ToastTitle>{data.message}</ToastTitle>
              </Toast>
            );
          },
        });
      } else {
        console.log(data);
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="error">
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
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 15,
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
            style={{ width: "100%", height: 150, borderRadius: 20 }}
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
              <Ionicons
                name="flash-outline"
                size={16}
                color={isDark ? "#fff" : "#000"}
              />
              <Text
                style={{
                  marginRight: 10,
                  marginLeft: 2,
                  color: isDark ? "#fff" : "#000",
                }}
              >
                Fast
              </Text>
              <Ionicons
                name="tv-outline"
                size={16}
                color={isDark ? "#fff" : "#000"}
              />
              <Text
                style={{
                  marginRight: 10,
                  marginLeft: 2,
                  color: isDark ? "#fff" : "#000",
                }}
              >
                OLED
              </Text>
              <Ionicons
                name="people-outline"
                size={16}
                color={isDark ? "#fff" : "#000"}
              />
              <Text
                style={{
                  marginRight: 10,
                  marginLeft: 2,
                  color: isDark ? "#fff" : "#000",
                }}
              >
                {roomData.minOccupancy} - {roomData.maxOccupancy}
              </Text>
              <Ionicons
                name="business-outline"
                size={16}
                color={isDark ? "#fff" : "#000"}
              />
              <Text
                style={{
                  marginRight: 10,
                  marginLeft: 2,
                  color: isDark ? "#fff" : "#000",
                }}
              >
                Floor {roomData.floorNo}
              </Text>
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
                  Check in: 07:30
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
                  Check out: 10:30
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
          <View style={{ flexDirection: "row", margin: 15 }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#E0E0E0",
                borderRadius: 25,
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
                borderRadius: 20,
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


          <TouchableOpacity
            style={{ margin: 15, borderRadius: 25 }}
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
                borderRadius: 25,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Send invites
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentStep(2)}>
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
        <View style={{ padding: 15 }}>
          <Text
            style={{
              fontSize: 16,
              color: isDark ? "#fff" : "#000",
            }}
          >
            Receipt details go here...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookingDetails;
