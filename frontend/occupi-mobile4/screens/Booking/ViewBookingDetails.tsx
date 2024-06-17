import React, { useEffect, useState } from 'react';
import { Icon, ScrollView, View, Text, Input, InputField, Button, ButtonText, Image, Box, ChevronDownIcon } from '@gluestack-ui/themed';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';


const ViewBookingDetails = (bookingId, roomName) => {
    const colorScheme = useColorScheme();
    return (
        <View pt="$16" flex="$1" backgroundColor={colorScheme === 'dark' ? 'black' : 'white'}>
            <View flexDirection="$row" alignItems="$center" >
                <Icon as={Feather} name="chevron-left" size="40" color={colorScheme === 'dark' ? 'white' : 'black'} />
                <Text fontWeight="$bold" fontSize="$16" left="$10" color={colorScheme === 'dark' ? 'white' : 'black'}>HDMI Room</Text>
            </View>
            <ScrollView>
            <View height="$4/5" my="$4">
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
            <View px="$4">
                <Text my="$2" fontSize="$20" fontWeight="$bold" color={colorScheme === 'dark' ? 'white' : 'black'}>The HDMI Room</Text>
                <Text my="$1" fontSize="$16" fontWeight="$bold" color={colorScheme === 'dark' ? 'white' : 'black'}>Description</Text>
                <Text fontSize="$14" color={colorScheme === 'dark' ? 'white' : 'black'}>Lorem ipsum dolor sit amet consectetur. Ut lectus rutrum imperdiet enim consectetur egestas sem. Est tellus id nulla morbi. Nibh nulla at diam morbi cras viverra vivamus risus scelerisque. Tempus urna habitant ultrices id ac sed interdum viverra. Integer auctor eget tincidunt lobortis semper. Morbi vel diam risus porta ac hendrerit semper nec aliquet. Ut at euismod sit sapien pretium diam. Sem consectetur molestie nentesque et ultricies tempor.  nunc amet. Elementum dictumst tellus vel pharetra sed ac condimentum nisi.</Text>
            </View>
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