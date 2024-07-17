import React, { useState, useEffect } from 'react';
import {
    Icon,
    ScrollView,
    View,
    Text,
    Image,
    Toast,
    useToast,
    ToastTitle
} from '@gluestack-ui/themed';
import {
    Feather,
    Ionicons,
    MaterialCommunityIcons,
    Octicons,
    EvilIcons,
    MaterialIcons
} from '@expo/vector-icons';
import { useColorScheme, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
    widthPercentageToDP as wp
} from 'react-native-responsive-screen';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';

interface Room {
    _id: string;
    roomName: string;
    roomId: string;
    roomNo: number;
    floorNo: number;
    minOccupancy: number;
    maxOccupancy: number;
    description: string;
    emails: string[];
    date: string;
    start: string;
    end: string;
    creator: string;
}

const ViewBookingDetails = (bookingId:string, roomName:string) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [room, setRoom] = useState<Room>({});
    const router = useRouter();
    const [checkedIn, setCheckedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const apiUrl = process.env.EXPO_PUBLIC_DEVELOP_API_URL;
    const checkinendpoint = process.env.EXPO_PUBLIC_CHECK_IN;
    const cancelbookingendpoint = process.env.EXPO_PUBLIC_CANCEL_BOOKING;

    // console.log("HERE:" + room);

    useEffect(() => {
        const getCurrentRoom = async () => {
          let result : string = await SecureStore.getItemAsync('CurrentRoom');
        //   console.log("CurrentRoom:",result);
          // setUserDetails(JSON.parse(result).data);
          let jsonresult = JSON.parse(result);
          console.log(jsonresult);
          setRoom(jsonresult);
          setCheckedIn(jsonresult.checkedIn);
        };
        getCurrentRoom();
      }, []);

    //   console.log("Room",room._id);
    

    const checkin = async () => {
        const body = {
            "bookingId": room._id,
            "creator": room.creator
        };
        setIsLoading(true);
        console.log(body);
        // console.log(apiUrl+""+checkinendpoint);
        let authToken = await SecureStore.getItemAsync('Token');
        try {
            const response = await fetch(`${apiUrl}${checkinendpoint}`, {
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
            // console.log(data);
            // const cookies = response.headers.get('Accept');
            //   console.log(cookies);
            if (response.ok) {
                setCheckedIn(true);
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
                setIsLoading(false);
            } else {
                setIsLoading(false);
                console.log(data);
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
        }
    };

    const cancelBooking = async () => {
        const body = {
            "bookingId": room._id,
            "creator": room.creator,
            "roomId": room.roomId,
            "emails": room.emails,
            "roomName": room.roomName,
            "floorNo": room.floorNo,
            "date": room.date,
            "start": room.start,
            "end": room.end

        };
        setIsLoading(true);
        console.log(body);
        let authToken = await SecureStore.getItemAsync('Token');
        try {
            const response = await fetch(`${apiUrl}${cancelbookingendpoint}`, {
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
            // const cookies = response.headers.get('Accept');
            //   console.log(cookies);
            if (response.ok) {
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
                setIsLoading(false);
                router.replace("/home");
            } else {
                setIsLoading(false);
                console.log(data);
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
        }
    };

    return (
        <View pt="$16" flex="$1" backgroundColor={colorScheme === 'dark' ? 'black' : 'white'}>
            <View flexDirection="$row" alignItems="$center" >
                <Icon as={Feather} name="chevron-left" size="40" color={colorScheme === 'dark' ? 'white' : 'black'} onPress={() => router.back()} />
                <Text fontWeight="$bold" fontSize="$16" left="$10" color={colorScheme === 'dark' ? 'white' : 'black'}>{room.roomName}</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} style={{ paddingBottom: 20, paddingHorizontal: 11 }} showsVerticalScrollIndicator={false}>
                <View height={400} my="$4">
                    <PagerView style={styles.container} initialPage={0}>
                        <View style={styles.page} key="1">
                            <Image alt="slide1" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                        </View>
                        <View style={styles.page} key="2">
                            <Image alt="slide2" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                        </View>
                        <View style={styles.page} key="3">
                            <Image alt="slide3" style={{ width: '90%', height: '100%', borderRadius: 20 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                        </View>
                    </PagerView>
                </View>
                <View style={{ padding: wp('5%') }}>
                    <Text fontSize="$24" fontWeight="$bold" mb="$3" style={{ color: isDarkMode ? '#fff' : '#000' }}>{room.roomName}</Text>
                    <View alignItems="center" flexDirection="row">
                        <Ionicons name="wifi" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text color={isDarkMode ? '#fff' : '#000'}> Fast   </Text>
                        <MaterialCommunityIcons name="television" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text color={isDarkMode ? '#fff' : '#000'}> OLED   </Text>
                        <Octicons name="people" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text color={isDarkMode ? '#fff' : '#000'}> 3 - 5   </Text>
                        <Feather name="layers" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text color={isDarkMode ? '#fff' : '#000'}> Floor: {room.floorNo === 0 ? 'G' : room.floorNo}</Text>
                    </View>
                </View>
                <View px="$4">
                    <View flexDirection="$row" alignItems="$center">
                        <Octicons name="people" size={24} color={isDarkMode ? '#fff' : '#000'} />
                        <Text color={isDarkMode ? '#fff' : '#000'} fontSize="$20"> Attendees: {room.emails?.length}</Text>

                    </View>
                    {room.emails?.map((email, idx) => (
                        <Text color={isDarkMode ? '#fff' : '#000'}>{idx + 1}. {email}</Text>
                    ))}
                    <Text mt="$4" mb="$1" fontSize="$16" fontWeight="$bold" color={colorScheme === 'dark' ? 'white' : 'black'}>Description</Text>
                    <Text fontSize="$14" color={colorScheme === 'dark' ? 'white' : 'black'}>The {room.roomName} is a state-of-the-art conference space designed for modern digital connectivity, seating 3-6 comfortably. Equipped with multiple HDMI ports, a high-definition projector or large LED screen, surround sound, and wireless display options, it ensures seamless presentations and video conferencing. The room features an intuitive control panel, high-speed Wi-Fi, and ample power outlets. Additional amenities include whiteboards, flip charts, adjustable lighting, and climate control, all within a professional and comfortable interior designed for productivity.</Text>
                </View>
                <TouchableOpacity style={{ paddingHorizontal: 15 }}>
                    <View flexDirection="$row" my="$2" borderRadius="$10" alignItems="$center" justifyContent="$center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                        <Ionicons name="receipt-outline" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$bold" color={isDarkMode ? '#fff' : '#000'}> ViewBooking</Text>
                    </View>
                </TouchableOpacity>
                {isLoading ? (
                    <TouchableOpacity style={{ paddingHorizontal: 15 }} >
                        <View flexDirection="$row" my="$2" borderRadius="$10" alignItems="$center" justifyContent="$center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                            <ActivityIndicator size="small" color={isDarkMode ? '#fff' : '#000'} />
                        </View>
                    </TouchableOpacity>
                ) : (
                    !checkedIn ? (
                        <TouchableOpacity style={{ paddingHorizontal: 15 }} onPress={() => checkin()}>
                            <View flexDirection="row" my="2" borderRadius="10" alignItems="center" justifyContent="center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                                <Feather name="check-square" size={24} color={isDarkMode ? '#fff' : '#000'} />
                                <Text fontWeight="bold" color={isDarkMode ? '#fff' : '#000'}> Check in</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={{ paddingHorizontal: 15 }} onPress={() => checkin()}>
                            <View flexDirection="row" my="2" borderRadius="10" alignItems="center" justifyContent="center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                                <MaterialIcons name="logout" size={24} color={isDarkMode ? '#fff' : '#000'} />
                                <Text fontWeight="bold" color={isDarkMode ? '#fff' : '#000'}> Check out</Text>
                            </View>
                        </TouchableOpacity>
                    )
                )}


                {!isLoading ? (
                    <TouchableOpacity style={{ paddingHorizontal: 15 }} onPress={() => cancelBooking()}>
                        <View flexDirection="$row" my="$2" borderRadius="$10" alignItems="$center" justifyContent="$center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                            <EvilIcons name="trash" size={36} color="darkred" /><Text fontWeight="$bold" color="maroon">Cancel Booking</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={{ paddingHorizontal: 15 }} >
                        <View flexDirection="$row" my="$2" borderRadius="$10" alignItems="$center" justifyContent="$center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                            <ActivityIndicator size="small" color={isDarkMode ? '#fff' : '#000'} />
                        </View>
                    </TouchableOpacity>
                )}


            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    page: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ViewBookingDetails;