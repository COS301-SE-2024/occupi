import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, useColorScheme, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import {
    Icon, View, Text, Input, InputField, Image, Box, ChevronDownIcon, Toast, Stack,
    ToastTitle,
    useToast,
} from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SimpleLineIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { Octicons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/NavBar';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { Skeleton } from 'moti/skeleton';
import { Booking } from '@/models/data';
import { fetchUserBookings } from '@/utils/bookings';



const groupDataInPairs = (data) => {
    const pairs = [];
    for (let i = 0; i < 10; i += 2) {
        pairs.push(data?.slice(i, i + 2));
    }
    return pairs;
};

function extractTimeFromDate(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() - 2);
    return date.toTimeString().substring(0, 5);
}

function extractDateFromDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toDateString();
}

const ViewBookings = () => {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [layout, setLayout] = useState("row");
    const [roomData, setRoomData] = useState<Booking[]>();
    // const [selectedSort, setSelectedSort] = useState("newest");
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        const getRoomData = async () => {
          try {
            const roomData = await fetchUserBookings();
            if (roomData) {
                // console.log(roomData);
              setRoomData(roomData);
            } else {
                setRoomData([]); // Default value if no username is found
            }
          } catch (error) {
            console.error('Error fetching bookings:', error);
          }
          setLoading(false);
        };
        getRoomData();
      }, []);


    const onRefresh = React.useCallback(() => {
        const getRoomData = async () => {
            try {
              const roomData = await fetchUserBookings();
              if (roomData) {
                  // console.log(roomData);
                setRoomData(roomData);
              } else {
                  setRoomData([]); // Default value if no username is found
              }
            } catch (error) {
              console.error('Error fetching bookings:', error);
            }
            setLoading(false);
          };
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            getRoomData();
        }, 2000);
    }, []);

    const toggleLayout = () => {
        setLayout((prevLayout) => (prevLayout === "row" ? "grid" : "row"));
    };
    useEffect(() => {
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);
    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';
    const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';



    const roomPairs = groupDataInPairs(roomData);

    const handleRoomClick = async (value: string) => {
        await SecureStore.setItemAsync('CurrentRoom', value);
        router.push('/viewbookingdetails');
        // console.log(value);
    }

    return (
        <View px="$4" style={{ flex: 1, backgroundColor, paddingTop: 60 }}>
            <View style={{ flexDirection: 'column', backgroundColor }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text fontWeight="$bold" fontSize={24} color={textColor}>My bookings</Text>
                </View>
                <Input my="$6" w="$full" backgroundColor={cardBackgroundColor} borderRadius="$xl" borderColor={cardBackgroundColor} h={hp('5%')}>
                    <InputField
                        placeholder="Quick search for an office"
                        fontSize={wp('4%')}
                        type="text"
                        returnKeyType="done"
                        color={textColor}
                    />
                </Input>
                <View flexDirection="row" justifyContent="space-between" alignItems="center">
                    <View flexDirection="row" alignItems="center">
                        <Text fontWeight="$bold" fontSize={18} mr="$2" color={textColor}>Sort by:</Text>
                        <View backgroundColor={cardBackgroundColor} borderRadius="$lg" px="$2" alignItems="center">
                            <RNPickerSelect
                                onValueChange={(value) => setSelectedSort(value)}
                                items={[
                                    { label: 'Oldest', value: 'Oldest' },
                                    { label: 'Newest', value: 'Newest' },
                                ]}
                                placeholder={{ label: 'Latest', value: null }}
                                // backgroundColor={cardBackgroundColor}
                                style={{
                                    inputIOS: {
                                        fontSize: 16,
                                        paddingVertical: 8,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: cardBackgroundColor,
                                        paddingRight: 30, // to ensure the text is never behind the icon
                                        color: textColor
                                    },
                                    inputAndroid: {
                                        alignItems: "center",
                                        width: 130,
                                        height: 60,
                                        fontSize: 10,
                                        // paddingVertical: 4,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: cardBackgroundColor,
                                        padding: 0, // to ensure the text is never behind the icon
                                        color: textColor
                                    },
                                }}

                            />
                        </View>
                    </View>
                    <TouchableOpacity onPress={toggleLayout}>
                        {layout === "row" ? (
                            <Box backgroundColor="$#ADFF2F" alignSelf="center" p="$2" borderRadius="$lg">
                                <Ionicons name="grid-outline" size={22} color="#2C2C2E" />
                            </Box>
                        ) : (
                            <Box backgroundColor="$#ADFF2F" alignSelf="center" p="$2" borderRadius="$lg">
                                <Octicons name="rows" size={22} color="#2C2C2E" />
                            </Box>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {loading === true ? (
                <>
                    <View mt='$4'>
                        <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={160} width={"100%"} />
                    </View>
                    <View mt='$2'>
                        <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={160} width={"100%"} />
                    </View>
                    <View mt='$2'>
                        <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={160} width={"100%"} />
                    </View>
                </>
            ) :
                layout === "grid" ? (
                    <ScrollView
                        style={{ flex: 1, marginTop: 10, marginBottom: 84 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        {roomPairs.map((pair, index) => (
                            <View
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}
                            >
                                {pair.map((room) => (
                                    <TouchableOpacity
                                        onPress={() => handleRoomClick(JSON.stringify(room))}
                                        style={{
                                            flex: 1,
                                            borderWidth: 1,
                                            borderColor: cardBackgroundColor,
                                            borderRadius: 12,
                                            backgroundColor: cardBackgroundColor,
                                            marginHorizontal: 4,
                                            width: '45%'
                                        }}>
                                        <Image
                                            w="$full"
                                            h="$24"
                                            alt="image"
                                            borderRadius={10}
                                            source={'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png'}
                                        />
                                        <View
                                            // key={room.title}
                                            style={{
                                                padding: 10,
                                            }}
                                        >
                                            <View>
                                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                                                <View flexDirection="row" alignItems="center">
                                                    <Octicons name="people" size={22} color={isDarkMode ? '#fff' : '#000'} /><Text style={{ color: textColor }} fontSize={15}> Attendees: {room.emails?.length}</Text>
                                                </View>
                                                <Text color={isDarkMode ? '#fff' : '#000'} fontWeight="$light" my="$1">Your booking time:</Text>
                                            </View>
                                            <View flexDirection="row" alignItems="center" justifyContent="space-between">
                                                <View>
                                                    <Text my="$1" fontSize={14} fontWeight="$light" color={textColor}>{extractDateFromDate(room.date)} </Text>
                                                    <Text>{extractTimeFromDate(room.start)}-{extractTimeFromDate(room.end)}</Text>
                                                </View>
                                                <SimpleLineIcons name="options" size={24} color={isDarkMode ? "white" : "black"} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <ScrollView
                        style={{ flex: 1, marginTop: 10, marginBottom: 84 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        {roomData?.map((room) => (
                            <TouchableOpacity
                                onPress={() => handleRoomClick(JSON.stringify(room))}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: cardBackgroundColor,
                                    borderRadius: 12,
                                    height: 160,
                                    backgroundColor: cardBackgroundColor,
                                    marginVertical: 4,
                                    flexDirection: "row"

                                }}>
                                <Image
                                    width={"50%"}
                                    h="$full"
                                    alt="image"
                                    borderRadius={10}
                                    source={'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png'}
                                />
                                <View
                                    // key={room.title}
                                    w="$48"
                                    style={{
                                        padding: 10,
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                                    <View flexDirection="row" alignItems="center">
                                        <Octicons name="people" size={22} color={isDarkMode ? '#fff' : '#000'} /><Text style={{ color: textColor }} fontSize={15}> Attendees: {room.emails?.length}</Text>
                                    </View>
                                    <View flexDirection="column">
                                        <Text my="$1" fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}>Your booking time:</Text>
                                        <View flexDirection="row" alignItems="center" justifyContent="space-between" pr="$4">
                                            <View>
                                                <Text my="$1" fontSize={14} fontWeight="$light" color={textColor}>{extractDateFromDate(room.date)}</Text>
                                                <Text>{extractTimeFromDate(room.start)}-{extractTimeFromDate(room.end)}</Text>
                                            </View>
                                            <SimpleLineIcons name="options" size={24} color={isDarkMode ? "white" : "black"} />
                                        </View>
                                    </View>

                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            <Navbar style={{ position: 'absolute', bottom: 0, width: '100%' }} />
        </View>
    );
};

export default ViewBookings;
