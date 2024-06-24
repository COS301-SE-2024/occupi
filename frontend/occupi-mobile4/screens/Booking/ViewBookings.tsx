import { React, useEffect, useState } from 'react';
import { ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import {
    Icon, View, Text, Input, InputField, Image, Box, ChevronDownIcon, Toast,
    ToastTitle,
    useToast,
} from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SimpleLineIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { Octicons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/NavBar';
import { useRouter } from 'expo-router';

const groupDataInPairs = (data) => {
    const pairs = [];
    for (let i = 0; i < data.length; i += 2) {
        pairs.push(data.slice(i, i + 2));
    }
    return pairs;
};

interface Room {
    _id: string;
    roomName: string;
    roomId: string;
    roomNo: number;
    floorNo: number;
    minOccupancy: number;
    maxOccupancy: number;
    description: string;
}

const getTimeForSlot = (slot) => {
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

const slotToTime = (slot : number) => {
    const { startTime, endTime } = getTimeForSlot(slot);
    return `${startTime} - ${endTime}`
}

const ViewBookings = () => {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [layout, setLayout] = useState("row");
    const toast = useToast();
    const [roomData, setRoomData] = useState<Room[]>([]);
    // const [selectedSort, setSelectedSort] = useState("newest");
    // const [email, setEmail] = useState('kamogelomoeketse@gmail.com');
    const router = useRouter();
    
    const toggleLayout = () => {
        setLayout((prevLayout) => (prevLayout === "row" ? "grid" : "row"));
    };
    useEffect(() => {
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);
    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';
    const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';
    // const data = [
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    //     { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    // ];

    useEffect(() => {
        const fetchAllRooms = async () => {
            console.log("heree");
            try {
                const response = await fetch(`https://dev.occupi.tech/api/view-bookings?email=kamogelomoeketse@gmail.com`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setRoomData(data.data || []); // Ensure data is an array
                    console.log(data);
                    // toast.show({
                    //     placement: 'top',
                    //     render: ({ id }) => {
                    //         return (
                    //             <Toast nativeID={id} variant="accent" action="success">
                    //                 <ToastTitle>{data.message}</ToastTitle>
                    //             </Toast>
                    //         );
                    //     },
                    // });
                } else {
                    console.log(data);
                    toast.show({
                        placement: 'top',
                        render: ({ id }) => {
                            return (
                                <Toast nativeID={id} variant="accent" action="error">
                                    <ToastTitle>{data.error.message}</ToastTitle>
                                </Toast>
                            );
                        },
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                toast.show({
                    placement: 'top',
                    render: ({ id }) => {
                        return (
                            <Toast nativeID={id} variant="accent" action="error">
                                <ToastTitle>Network Error: {error.message}</ToastTitle>
                            </Toast>
                        );
                    },
                });
            }
        };
        fetchAllRooms();
    }, [toast]);

    const roomPairs = groupDataInPairs(roomData);

    return (
        <View px="$4" pt="$20" style={{ flex: 1, backgroundColor }}>
            <View style={{ flexDirection: 'column', backgroundColor }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text fontWeight="$bold" fontSize="$24" color={textColor}>My bookings</Text>
                </View>
                <Input my="$6" w="$full" backgroundColor={cardBackgroundColor} borderRadius="$15" borderColor={cardBackgroundColor} h={hp('5%')}>
                    <InputField
                        placeholder="Quick search for an office"
                        fontSize={wp('4%')}
                        type="text"
                        returnKeyType="done"
                        color={textColor}
                    />
                </Input>
                <View flexDirection="$row" justifyContent="$space-between" alignItems="$center">
                    <View flexDirection="$row" alignItems="$center">
                        <Text fontWeight="$bold" fontSize="$18" mr="$2" color={textColor}>Sort by:</Text>
                        <View backgroundColor={cardBackgroundColor} borderRadius="$10" px="$2" alignItems="$center">
                            <RNPickerSelect
                                onValueChange={(value) => setSelectedSort(value)}
                                items={[
                                    { label: 'Oldest', value: 'Oldest' },
                                    { label: 'Newest', value: 'Newest' },
                                ]}
                                placeholder={{ label: 'Latest', value: null }}
                                backgroundColor={cardBackgroundColor}
                                style={{
                                    inputIOS: {
                                        placeholder: "Latest",
                                        fontSize: 16,
                                        paddingVertical: 8,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: cardBackgroundColor,
                                        paddingRight: 30, // to ensure the text is never behind the icon
                                        color: textColor
                                    },
                                    inputAndroid: {
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: cardBackgroundColor,
                                        paddingRight: 30, // to ensure the text is never behind the icon
                                        color: textColor
                                    },
                                }}
                                Icon={() => {
                                    return <Icon as={ChevronDownIcon} color={textColor} mt="$2.5" alignSelf="$center" />;
                                }}
                            />
                        </View>
                    </View>
                    <TouchableOpacity onPress={toggleLayout}>
                        {layout === "row" ? (
                            <Box backgroundColor="$#ADFF2F" alignSelf="$center" p="$2" borderRadius="$12">
                                <Ionicons name="grid-outline" size={22} color="#2C2C2E" />
                            </Box>
                        ) : (
                            <Box backgroundColor="$#ADFF2F" alignSelf="$center" p="$2" borderRadius="$12">
                                <Octicons name="rows" size={22} color="#2C2C2E" />
                            </Box>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            {layout === "grid" ? (
                <ScrollView style={{ flex: 1, marginTop: 10, marginBottom:84 }} showsVerticalScrollIndicator={false}>
                    {roomPairs.map((pair, index) => (
                        <View
                            // key={index}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 20,
                            }}
                        >
                            {pair.map((room) => (
                                <TouchableOpacity 
                                onPress={() => router.push({ pathname: '/viewbookingdetails', params: { roomData: JSON.stringify(room) } })}
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
                                        borderRadius="$10"
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
                                            <View flexDirection="$row" alignItems="$center">
                                                <Octicons name="people" size={22} color={isDarkMode ? '#fff' : '#000'} /><Text style={{ color: textColor }} fontSize="$15"> Attendees: {room.emails.length}</Text>
                                            </View>
                                            <Text my="$1">Your booking time:</Text>
                                        </View>
                                        <View flexDirection="$row" alignItems="$center" justifyContent="space-between">
                                            <View>
                                                <Text my="$1" fontSize="$14" fontWeight="$light" color={textColor}>{new Date().toDateString()}</Text>
                                                <Text>{slotToTime(room.slot)}</Text>
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
                <ScrollView style={{ flex: 1, marginTop: 10, marginBottom:84 }} showsVerticalScrollIndicator={false}>
                    {roomData.map((room) => (
                        <TouchableOpacity 
                        onPress={() => router.push({ pathname: '/viewbookingdetails', params: { roomData: JSON.stringify(room) } })}
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
                                w="$50%"
                                h="$full"
                                alt="image"
                                borderRadius="$10"
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
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                                <View flexDirection="$row" alignItems="$center">
                                    <Octicons name="people" size={22} color={isDarkMode ? '#fff' : '#000'} /><Text style={{ color: textColor }} fontSize="$15"> Attendees: {room.emails.length}</Text>
                                </View>
                                <View flexDirection="$column">
                                    <Text my="$1" fontWeight="$light" color={isDarkMode ? '#F3F3F3' : '#2C2C2E'}>Your booking time:</Text>
                                    <View flexDirection="$row" alignItems="$center" justifyContent="space-between" pr="$4">
                                        <View>
                                            <Text my="$1" fontSize="$14" fontWeight="$light" color={textColor}>{new Date().toDateString()}</Text>
                                            <Text>{slotToTime(room.slot)}</Text>
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
