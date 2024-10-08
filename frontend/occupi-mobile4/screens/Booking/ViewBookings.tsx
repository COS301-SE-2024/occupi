import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, useColorScheme, TouchableOpacity, RefreshControl } from 'react-native';
import { View, Text, Input, InputField, Image } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import RNPickerSelect from 'react-native-picker-select';
import { Octicons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/NavBar';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { Skeleton } from 'moti/skeleton';
import { Booking } from '@/models/data';
import { fetchUserBookings } from '@/utils/bookings';
import { useTheme } from '@/components/ThemeContext';
import Tooltip from '@/components/Tooltip';
import { getHistoricalBookings, getCurrentBookings } from '@/utils/analytics';

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
    const colorscheme = useColorScheme();
    const { theme } = useTheme();
    const currentTheme = theme === "system" ? colorscheme : theme;
    const isDarkMode = currentTheme === "dark";
    const [layout, setLayout] = useState("row");
    const [roomData, setRoomData] = useState<Booking[]>();
    const [selectedSort, setSelectedSort] = useState("newest");
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [resolution, setResolution] = useState("low");
    const [activeTab, setActiveTab] = useState('current');
    const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
    const [pastBookings, setPastBookings] = useState<Booking[]>([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const currentData = await getCurrentBookings();
                const historicalData = await getHistoricalBookings();
                // console.log(currentData);
                if (currentData) {
                    setCurrentBookings(currentData);
                }
                if (historicalData) {
                    setPastBookings(historicalData);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const onRefreshCalling = useCallback(() => {
        setRefreshing(true);
        const fetchBookings = async () => {
            try {
                const currentData = await getCurrentBookings();
                const historicalData = await getHistoricalBookings();

                if (currentData && currentData.data) {
                    setCurrentBookings(currentData.data);
                }
                if (historicalData && historicalData.data) {
                    setPastBookings(historicalData.data);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setRefreshing(false);
            }
        };

        fetchBookings();
    }, []);

    // useEffect(() => {
    //     const getRoomData = async () => {
    //         try {
    //             const roomData = await fetchUserBookings(selectedSort);
    //             if (roomData) {
    //                 const now = new Date();
    //                 const current = roomData.filter(booking => new Date(booking.date) >= now);
    //                 const past = roomData.filter(booking => new Date(booking.date) < now);
    //                 // console.log(current);
    //                 setCurrentBookings(current);
    //                 setPastBookings(past);
    //                 setRoomData(roomData);
    //             } else {
    //                 setCurrentBookings([]);
    //                 setPastBookings([]);
    //                 setRoomData([]);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching bookings:', error);
    //         }
    //         setLoading(false);
    //     };
    //     getRoomData();
    // }, []);

    const [accentColour, setAccentColour] = useState<string>('greenyellow');

    useEffect(() => {
        const getAccentColour = async () => {
            let accentcolour = await SecureStore.getItemAsync('accentColour');
            setAccentColour(accentcolour);
        };
        const setResolutionToMid = () => {
            setTimeout(() => {
              setResolution("mid");
            }, 1000);
          };
        
          const setResolutionToHigh = () => {
            setTimeout(() => {
              setResolution("high");
            }, 3000);
          };
          setResolutionToMid();
          setResolutionToHigh();
        getAccentColour();
    }, []);


    const onRefresh = React.useCallback(() => {
        const getRoomData = async () => {
            try {
                const roomData = await fetchUserBookings(selectedSort);
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

    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';
    const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';

    const handleRoomClick = async (value: string) => {
        await SecureStore.setItemAsync('CurrentRoom', value);
        router.push('/viewbookingdetails');
        // console.log(value);
    }

    const renderBookings = (bookings: Booking[]) => {
        // console.log('boookings',bookings);
        if (loading) {
            return (
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
            );
        }

        if (bookings.length === 0) {
            return (
                <View alignItems='center' justifyContent='center' flexDirection='column' height={'60%'}>
                    <Text fontSize={25} fontWeight={'$bold'} color={textColor}>No {activeTab} bookings found</Text>
                </View>
            );
        }

        const roomPairs = groupDataInPairs(bookings);

        return layout === "grid" ? (
            <ScrollView
                style={{ flex: 1, marginTop: 10, marginBottom: 84 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {roomPairs.map((pair, index) => (
                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        {pair.map((room : Booking, idx) => (
                            <TouchableOpacity key={idx} style={{ flex: 1, borderWidth: 1, borderColor: cardBackgroundColor, borderRadius: 12, backgroundColor: cardBackgroundColor, marginHorizontal: 4 }} onPress={() => handleRoomClick(JSON.stringify(room))}>
                                <Image alt="room" style={{ width: '100%', height: 96, borderRadius: 10 }} source={{ uri: room.roomImage === undefined ? 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' : resolution === "low" ? room.roomImage?.thumbnailRes : resolution === "mid" ? room.roomImage?.midRes : room.roomImage?.highRes }} />
                                <View style={{ padding: 10 }}>
                                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                                    <View flexDirection="column">
                                        <View flexDirection="row" alignItems="center" justifyContent="space-between" pr="$4">
                                            <View>
                                                <Text my="$1" fontSize={15} fontWeight="$light" color={textColor}>
                                                    {extractDateFromDate(room.date)}
                                                </Text>
                                                <Text>
                                                    {extractTimeFromDate(room.start)}
                                                    {extractTimeFromDate(room.start) && extractTimeFromDate(room.end) ? '-' : ''}
                                                    {extractTimeFromDate(room.end)}
                                                </Text>
                                            </View>
                                        </View>
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
                {bookings.map((room, idx) => (
                    <TouchableOpacity
                        key={idx}
                        onPress={() => handleRoomClick(JSON.stringify(room))}
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: cardBackgroundColor,
                            borderRadius: 12,
                            height: 160,
                            backgroundColor: cardBackgroundColor,
                            marginVertical: 4,
                            flexDirection: "row",
                        }}
                    >
                        <Image
                            width={"45%"}
                            h="$full"
                            alt="image"
                            borderRadius={10}
                            source={room.roomImage === undefined ? 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' : resolution === "low" ? room.roomImage?.thumbnailRes : resolution === "mid" ? room.roomImage?.midRes : room.roomImage?.highRes}
                        />
                        <View
                            // key={room.title}
                            w="$48"
                            style={{
                                paddingHorizontal: 14,
                                paddingVertical: 18,
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                            <View flexDirection="column">
                                <View flexDirection="row" alignItems="center" justifyContent="space-between" pr="$4">
                                    <View>
                                        <Text my="$1" fontSize={15} fontWeight="$light" color={textColor}>
                                            {extractDateFromDate(room.date)}
                                        </Text>
                                        <Text>
                                            {extractTimeFromDate(room.start)}
                                            {extractTimeFromDate(room.start) && extractTimeFromDate(room.end) ? '-' : ''}
                                            {extractTimeFromDate(room.end)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };


    return (
        <View px="$4" style={{ flex: 1, backgroundColor, paddingTop: 80,  }}>
            <View style={{ flexDirection: 'column', backgroundColor }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text fontWeight="$bold" fontSize={24} color={textColor}>My Bookings</Text>
                    <Tooltip
                        content="Check your current and historical bookings!"
                        placement="bottom"
                    />
                </View>
                <View flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                    <View flexDirection="row">

                        <TouchableOpacity
                            onPress={() => setActiveTab('current')}
                            style={{
                                backgroundColor: activeTab === 'current' ? accentColour : 'transparent',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 15,
                                marginRight: 10
                            }}
                        >
                            <Text color={activeTab === 'current' ? 'black' : textColor}>Current</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('past')}
                            style={{
                                backgroundColor: activeTab === 'past' ? accentColour : 'transparent',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20
                            }}
                        >
                            <Text color={activeTab === 'past' ? 'black' : textColor}>Past</Text>
                        </TouchableOpacity>
                    </View>
                    <View flexDirection="row" alignItems="center">
                        {/* <Text fontWeight="$bold" fontSize={18} mr="$2" color={textColor}>Sort by:</Text> */}
                        <View backgroundColor={cardBackgroundColor} borderRadius="$lg" px="$2" alignItems="center">
                            <RNPickerSelect
                                onValueChange={(value) => setSelectedSort(value)}
                                items={[
                                    { label: 'Recent', value: 'Recent' },
                                    { label: 'Oldest', value: 'Oldest' },
                                ]}
                                placeholder={{ label: 'Recent', value: 'Recent' }}
                                // backgroundColor={cardBackgroundColor}
                                style={{
                                    inputIOS: {
                                        fontSize: 16,
                                        paddingVertical: 8,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: cardBackgroundColor,
                                        paddingRight: 30,
                                        color: textColor
                                    },
                                    inputAndroid: {
                                        alignItems: "center",
                                        width: 130,
                                        height: 60,
                                        fontSize: 10,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: cardBackgroundColor,
                                        padding: 0,
                                        color: textColor
                                    },
                                }}
                            />
                        </View>
                    </View>
                    <TouchableOpacity onPress={toggleLayout}>
                        {layout === "row" ? (
                            <View style={{ backgroundColor: `${accentColour}`, alignSelf: 'center', padding: 8, borderRadius: 12 }}>
                                <Ionicons name="grid-outline" size={22} color="#2C2C2E" />
                            </View>
                        ) : (
                            <View style={{ backgroundColor: `${accentColour}`, alignSelf: 'center', padding: 8, borderRadius: 12 }}>
                                <Octicons name="rows" size={22} color="#2C2C2E" />
                            </View>
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
            ) : activeTab === 'current' ? (
                currentBookings.length === 0 ? (
                    <View alignItems='center' justifyContent='center' flexDirection='column' height={'60%'}>
                        <Text fontSize={25} fontWeight={'$bold'} color={textColor}>No current bookings found</Text>
                    </View>
                ) : (
                    renderBookings(currentBookings)
                )
            ) : (
                pastBookings.length === 0 ? (
                    <View alignItems='center' justifyContent='center' flexDirection='column' height={'60%'}>
                        <Text fontSize={25} fontWeight={'$bold'} color={textColor}>No past bookings found</Text>
                    </View>
                ) : (
                    renderBookings(pastBookings)
                )
            )}
            <Navbar style={{ position: 'absolute', bottom: 0, width: '100%' }} />
        </View>
    );
};
export default ViewBookings;