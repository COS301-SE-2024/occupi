import React from 'react';
import { Icon, ScrollView, View, Text, Image } from '@gluestack-ui/themed';
import {
    Feather,
    Ionicons,
    MaterialCommunityIcons,
    Octicons,
    EvilIcons
} from '@expo/vector-icons';
import { useColorScheme, StyleSheet, TouchableOpacity } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import PagerView from 'react-native-pager-view';
import { useRouter, useLocalSearchParams } from 'expo-router';


const ViewBookingDetails = (bookingId, roomName) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    // const roomParams = useLocalSearchParams();
    // const roomData = roomParams.roomData;
    // const room = JSON.parse(roomData);
    const router = useRouter();
    // console.log("HERE:" + roomData);

    return (
        <View pt="$16" flex="$1" backgroundColor={colorScheme === 'dark' ? 'black' : 'white'}>
            <View flexDirection="$row" alignItems="$center" >
                <Icon as={Feather} name="chevron-left" size="40" color={colorScheme === 'dark' ? 'white' : 'black'} onPress={() => router.back()} />
                <Text fontWeight="$bold" fontSize="$16" left="$10" color={colorScheme === 'dark' ? 'white' : 'black'}>HDMI Room</Text>
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
                    <Text fontSize="$24" fontWeight="$bold" mb="$3" style={{ color: isDarkMode ? '#fff' : '#000' }}>HDMI Room</Text>
                    <View alignItems="center" flexDirection="row">
                        <Ionicons name="wifi" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}> Fast   </Text>
                        <MaterialCommunityIcons name="television" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}> OLED   </Text>
                        <Octicons name="people" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}> 3 - 5   </Text>
                        <Feather name="layers" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$light" color={isDarkMode ? '#fff' : '#000'}> Floor: 7</Text>
                    </View>
                </View>
                <View px="$4">
                    <View flexDirection="$row" alignItems="$center">
                        <Octicons name="people" size={24} color={isDarkMode ? '#fff' : '#000'} />
                        {/* <Text color={isDarkMode ? '#fff' : '#000'} fontSize="$20"> Attendees: {room.emails.length}</Text> */}

                    </View>
                    {/* {room.emails.map((room, idx) => (
                            <Text color={isDarkMode ? '#fff' : '#000'}>{idx+1}. {room}</Text>
                        ))} */}
                    <Text mt="$4" mb="$1" fontSize="$16" fontWeight="$bold" color={colorScheme === 'dark' ? 'white' : 'black'}>Description</Text>
                    <Text fontSize="$14" color={colorScheme === 'dark' ? 'white' : 'black'}>Lorem ipsum dolor sit amet consectetur. Ut lectus rutrum imperdiet enim consectetur egestas sem. Est tellus id nulla morbi. Nibh nulla at diam morbi cras viverra vivamus risus scelerisque. Tempus urna habitant ultrices id ac sed interdum viverra. Integer auctor eget tincidunt lobortis semper. Morbi vel diam risus porta ac hendrerit semper nec aliquet. Ut at euismod sit sapien pretium diam. Sem consectetur molestie nentesque et ultricies tempor.  nunc amet. Elementum dictumst tellus vel pharetra sed ac condimentum nisi.</Text>
                </View>
                <TouchableOpacity style={{ paddingHorizontal: 15 }}>
                    <View flexDirection="$row" my="$2" borderRadius="$10" alignItems="$center" justifyContent="$center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                        <Ionicons name="receipt-outline" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$bold" color={isDarkMode ? '#fff' : '#000'}> ViewBooking</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingHorizontal: 15 }}>
                    <View flexDirection="$row" my="$2" borderRadius="$10" alignItems="$center" justifyContent="$center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                        <Feather name="check-square" size={24} color={isDarkMode ? '#fff' : '#000'} /><Text fontWeight="$bold" color={isDarkMode ? '#fff' : '#000'}> Check in</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingHorizontal: 15 }}>
                    <View flexDirection="$row" my="$2" borderRadius="$10" alignItems="$center" justifyContent="$center" backgroundColor={isDarkMode ? '#2C2C2E' : '#F3F3F3'} h="$11">
                        <EvilIcons name="trash" size={36} color="darkred" /><Text fontWeight="$bold" color="maroon">Delete Booking</Text>
                    </View>
                </TouchableOpacity>
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