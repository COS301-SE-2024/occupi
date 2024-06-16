import { React, useEffect, useState } from 'react';
import { ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { Icon, View, Text, Input, InputField, InputSlotButton, Button, ButtonText, Image, Box, ChevronDownIcon } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SimpleLineIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { Octicons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/NavBar';

const groupDataInPairs = (data) => {
    const pairs = [];
    for (let i = 0; i < data.length; i += 2) {
        pairs.push(data.slice(i, i + 2));
    }
    return pairs;
};

const ViewBookings = () => {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [layout, setLayout] = useState("row");
    const [selectedSort, setSelectedSort] = useState("");
    const toggleLayout = () => {
        setLayout((prevLayout) => (prevLayout === "row" ? "grid" : "row"));
    };
    useEffect(() => {
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);
    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';
    const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';
    const sort = [
        { key: '1', value: 'Oldest', },
        { key: '2', value: 'Newest' },
    ]
    const data = [
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
        { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Date: '17/06/2024', Time: '07:30-09:30', available: true },
    ];

    const roomPairs = groupDataInPairs(data);

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
                                    return <Icon as={ChevronDownIcon} color={textColor} m="$2" w="$4" h="$4" alignSelf="$center" />;
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
                <ScrollView style={{ flex: 1, marginTop: 10 }} showsVerticalScrollIndicator={false}>
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
                                <View style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: cardBackgroundColor,
                                    borderRadius: 12,
                                    backgroundColor: cardBackgroundColor,
                                    marginHorizontal: 4,
                                }}>
                                    <Image
                                        w="$full"
                                        h="$24"
                                        alt="image"
                                        borderRadius="$10"
                                        source={'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png'}
                                    />
                                    <View
                                        key={room.title}
                                        style={{
                                            padding: 10,
                                        }}
                                    >
                                        <View>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.title}</Text>
                                            <Text style={{ color: textColor }} fontSize="$12">{room.description}</Text>
                                            <Text my="$1">Your booking time:</Text>

                                        </View>
                                        <View flexDirection="$row" alignItems="$center" justifyContent="space-between">
                                            <View>
                                                <Text>{room.Date} at</Text>
                                                <Text>{room.Time}</Text>
                                            </View>

                                            <SimpleLineIcons name="options" size={24} color={isDarkMode ? "white" : "black"} />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <ScrollView style={{ flex: 1, marginTop: 10 }} showsVerticalScrollIndicator={false}>
                    {data.map((room) => (
                        <View style={{
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
                                key={room.title}
                                w="$48"
                                style={{
                                    padding: 10,
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.title}</Text>
                                <View>
                                    <Text style={{ color: textColor }} fontSize="$12">{room.description}</Text>
                                </View>
                                <View flexDirection="$column">
                                    <Text my="$1" fontWeight="$light" color={isDarkMode ? '#F3F3F3' : '#2C2C2E'}>Your booking time:</Text>
                                    <View flexDirection="$row" alignItems="$center" justifyContent="space-between" pr="$4">
                                        <View>
                                            <Text>{room.Date} at</Text>
                                            <Text>{room.Time}</Text>
                                        </View>
                                        <SimpleLineIcons name="options" size={24} color={isDarkMode ? "white" : "black"} />
                                    </View>
                                </View>

                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            <Navbar style={{ position: 'absolute', bottom: 0, width: '100%' }} />
        </View>
    );
};

export default ViewBookings;
