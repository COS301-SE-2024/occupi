import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, ScrollView } from 'react-native';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Card,
    Button,
    ButtonText,
    Icon,
    ArrowRightIcon,
    Heading,
    ChevronRightIcon
} from '@gluestack-ui/themed';
import FloorDropdown from '../../components/FloorDropdown';
import GuestLayout from '../../layouts/GuestLayout';
import Navbar from "../../components/NavBar";
import { router } from 'expo-router';

const Bookings = () => {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

    useEffect(() => {
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);

    const backgroundColor = isDarkMode ? '#1C1C1E' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';
    const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';
    const buttonBackgroundColor = isDarkMode ? 'greenyellow' : 'greenyellow';
    const notAvailableButtonBackgroundColor = isDarkMode ? '#3A3A3C' : 'lightgrey';
    const fullyBookedButtonBackgroundColor = isDarkMode ? '#7F1D1D' : 'orangered';

    return (
        <>
            <ScrollView>
                <View pt="$16" px="$4" flex="$1" flexDirection="column" backgroundColor={backgroundColor}>
                    <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                    <View flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                        <Heading size="2xl" fontWeight="$bold" color={textColor}>Offices</Heading>
                        <Button w="$36" borderRadius="$12" backgroundColor={buttonBackgroundColor}><ButtonText color="dimgrey">Book Table</ButtonText></Button>
                    </View>
                    <FloorDropdown />
                    <Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{ height: 110 }} backgroundColor={cardBackgroundColor} borderRadius="$20">
                        <View flexDirection="row" justifyContent="space-between" alignItems="center">
                            <View flexDirection="column">
                                <Heading size="md" mt="$0" color={textColor}>HDMI Room</Heading>
                                <Text size="sm" color={textColor}>Boasting sunset views, long desk and a large TV.</Text>
                            </View>
                            <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center" color={textColor} />
                        </View>
                        <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
                            <Text size="sm" color={isDarkMode ? 'light-grey' : 'grey'}> Closes at: 7pm</Text>
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

export default Bookings;