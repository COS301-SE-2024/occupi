import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, ScrollView, Alert, StyleSheet } from 'react-native';
import {
    Text,
    View,
    Toast,
    useToast,
    ToastTitle,
    Button,
    ButtonText,
    Icon,
    Heading,
    ChevronRightIcon
} from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FloorDropdown from '../../components/FloorDropdown';
import Navbar from "../../components/NavBar";
import { router } from 'expo-router';

const Bookings = () => {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [isBooked, setisBooked] = useState(false);
    const toast = useToast();

    useEffect(() => {
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);

    const backgroundColor = isDarkMode ? '#1C1C1E' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';
    const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';
    const buttonBackgroundColor = 'greenyellow';
    const notAvailableButtonBackgroundColor = isDarkMode ? '#3A3A3C' : 'lightgrey';
    const fullyBookedButtonBackgroundColor = isDarkMode ? '#7F1D1D' : 'orangered';

    const handleBooking = (roomName) => {
        Alert.alert(
            "Book",
            `Book ${roomName} on floor 7?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { 
                    text: "OK", 
                    onPress: async () => {
                        setisBooked(true);
                        toast.show({
                            placement: 'top',
                            render: ({ id }) => {
                                return (
                                    <Toast nativeID={id} variant="accent" action="success">
                                        <ToastTitle>Room has been booked, an email has been sent to you with the details.</ToastTitle>
                                    </Toast>
                                );
                            },
                        });
                    }
                }
            ]
        );
    };

    return (
        <>
            <ScrollView>
                <View style={[styles.container, { backgroundColor }]}>
                    <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                    <View style={styles.header}>
                        <Heading style={[styles.heading, { color: textColor }]}>Offices</Heading>
                        <Button style={[styles.button, { backgroundColor: buttonBackgroundColor }]}>
                            <ButtonText style={styles.buttonText}>Book Table</ButtonText>
                        </Button>
                    </View>
                    <FloorDropdown />
                    {[
                        { name: 'HDMI Room', status: isBooked ? 'Booked' : 'Book now', closesAt: '7pm', buttonColor: isBooked ? 'orangered' : buttonBackgroundColor },
                        { name: 'Conference Room', status: 'Not Available', closesAt: '6pm', buttonColor: notAvailableButtonBackgroundColor },
                        { name: 'Meeting Room 1', status: 'Booked', closesAt: '6pm', buttonColor: fullyBookedButtonBackgroundColor },
                        { name: 'Meeting Room 2', status: 'Available now', closesAt: '6pm', buttonColor: buttonBackgroundColor },
                        { name: 'Conference Room', status: 'Not Available', closesAt: '6pm', buttonColor: notAvailableButtonBackgroundColor },
                        { name: 'Conference Room', status: 'Not Available', closesAt: '6pm', buttonColor: notAvailableButtonBackgroundColor },
                    ].map((room, index) => (
                        <View key={index} style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
                            <View style={styles.cardContent}>
                                <View>
                                    <Heading style={[styles.cardHeading, { color: textColor }]}>{room.name}</Heading>
                                    <Text style={[styles.cardText, { color: textColor }]}>Boasting sunset views, long desk and a large TV.</Text>
                                </View>
                                <Icon as={ChevronRightIcon} style={[styles.icon, { color: textColor }]} />
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={[styles.footerText, { color: isDarkMode ? 'lightgrey' : 'grey' }]}>Closes at: {room.closesAt}</Text>
                                <Button style={[styles.footerButton, { backgroundColor: room.buttonColor }]} onPress={() => handleBooking(room.name)}>
                                    <ButtonText style={styles.footerButtonText}>{room.status}</ButtonText>
                                </Button>
                            </View>
                        </View>
                    </Card>

<Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{ height: 110 }} backgroundColor={cardBackgroundColor} borderRadius="$20">
    <View flexDirection="row" justifyContent="space-between" alignItems="center">
        <View flexDirection="column">
            <Heading size="md" mt="$0" color={textColor}>Conference Room</Heading>
            <Text size="sm" color={textColor}>Boasting sunset views, long desk and a large TV.</Text>
        </View>
        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center" color={textColor} />
    </View>
    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text size="sm" color={isDarkMode ? 'light-grey' : 'grey'}>Closes at: 6pm</Text>
        <Button style={{ height: 32, width: 130 }} borderRadius="$8" backgroundColor={notAvailableButtonBackgroundColor} onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Not Available</ButtonText></Button>
    </View>
</Card>

<Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{ height: 110 }} backgroundColor={cardBackgroundColor} borderRadius="$20">
    <View flexDirection="row" justifyContent="space-between" alignItems="center">
        <View flexDirection="column">
            <Heading size="md" mt="$0" color={textColor}>Meeting Room 1</Heading>
            <Text size="sm" color={textColor}>Boasting sunset views, long desk and a large TV.</Text>
        </View>
        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center" color={textColor} />
    </View>
    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text size="sm" color={isDarkMode ? 'light-grey' : 'grey'}>Closes at: 6pm</Text>
        <Button style={{ height: 32, width: 130 }} borderRadius="$8" backgroundColor={fullyBookedButtonBackgroundColor} onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Fully Booked</ButtonText></Button>
    </View>
</Card>

<Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{ height: 110 }} backgroundColor={cardBackgroundColor} borderRadius="$20">
    <View flexDirection="row" justifyContent="space-between" alignItems="center">
        <View flexDirection="column">
            <Heading size="md" mt="$0" color={textColor}>Meeting Room 2</Heading>
            <Text size="sm" color={textColor}>Boasting sunset views, long desk and a large TV.</Text>
        </View>
        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center" color={textColor} />
    </View>
    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text size="sm" color={isDarkMode ? 'light-grey' : 'grey'}>Closes at: 6pm</Text>
        <Button style={{ height: 32, width: 130 }} borderRadius="$8" backgroundColor={buttonBackgroundColor} onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Available now</ButtonText></Button>
    </View>
</Card>

<Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{ height: 110 }} backgroundColor={cardBackgroundColor} borderRadius="$20">
    <View flexDirection="row" justifyContent="space-between" alignItems="center">
        <View flexDirection="column">
            <Heading size="md" mt="$0" color={textColor}>Conference Room</Heading>
            <Text size="sm" color={textColor}>Boasting sunset views, long desk and a large TV.</Text>
        </View>
        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center" color={textColor} />
    </View>
    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text size="sm" color={isDarkMode ? 'light-grey' : 'grey'}>Closes at: 6pm</Text>
        <Button style={{ height: 32, width: 130 }} borderRadius="$8" backgroundColor={notAvailableButtonBackgroundColor} onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Not Available</ButtonText></Button>
    </View>
</Card>

<Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{ height: 110 }} backgroundColor={cardBackgroundColor} borderRadius="$20">
    <View flexDirection="row" justifyContent="space-between" alignItems="center">
        <View flexDirection="column">
            <Heading size="md" mt="$0" color={textColor}>Conference Room</Heading>
            <Text size="sm" color={textColor}>Boasting sunset views, long desk and a large TV.</Text>
        </View>
        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center" color={textColor} />
    </View>
    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text size="sm" color={isDarkMode ? 'light-grey' : 'grey'}>Closes at: 6pm</Text>
        <Button style={{ height: 32, width: 130 }} borderRadius="$8" backgroundColor={notAvailableButtonBackgroundColor} onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Not Available</ButtonText></Button>
    </View>
</Card>
                </View>
            </ScrollView>
            <Navbar />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: hp('4%'),
        paddingHorizontal: wp('4%'),
        flex: 1,
        flexDirection: 'column'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('2%')
    },
    heading: {
        fontSize: wp('8%'),
        fontWeight: 'bold'
    },
    button: {
        width: wp('36%'),
        borderRadius: wp('3%'),
        paddingVertical: hp('1%'),
    },
    buttonText: {
        color: 'dimgrey',
        textAlign: 'center'
    },
    card: {
        width: '100%',
        borderRadius: wp('5%'),
        padding: wp('3%'),
        marginTop: hp('2%'),
        height: hp('14%'),
        justifyContent: 'space-between'
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardHeading: {
        fontSize: wp('5%'),
        marginBottom: hp('1%')
    },
    cardText: {
        fontSize: wp('3.5%')
    },
    icon: {
        width: wp('6%'),
        height: wp('6%')
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    footerText: {
        fontSize: wp('3.5%')
    },
    footerButton: {
        height: hp('4%'),
        width: wp('33%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerButtonText: {
        color: 'dimgrey',
        fontSize: wp('3.5%'),
        fontWeight: 'light'
    }
});

export default Bookings;
