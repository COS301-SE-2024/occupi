import React from 'react'
import { StatusBar } from 'expo-status-bar';
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
import FloorDropdown from '../../components/FloorDropdown'
import GuestLayout from '../../layouts/GuestLayout';

const Bookings = () => {
    return (
        <GuestLayout>
            <View pt="$2" px="$4" flex="$1" flexDirection="column" backgroundColor="white" >
                <View flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">    
                    <Heading size="2xl" fontWeight="$bold">Offices</Heading> 
                    <Button w="$36" borderRadius="$12" backgroundColor="greenyellow"><ButtonText color="dimgrey">Book Table</ButtonText></Button>
                </View>
                <FloorDropdown />
                <Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{height: 110 }} backgroundColor="#F3F3F3" borderRadius="$20">
                    <View flexDirection="row" justifyContent="space-between" alignItems="center">
                        <View flexDirection="column">
                            <Heading size="md" mt="$0">HDMI Room</Heading>
                            <Text size="sm">Boasting sunset views, long desk and a large TV.</Text>
                        </View>
                        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center"/>
                    </View>
                    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Text size="sm" color="grey">Closes at: 7pm</Text>
                        <Button style={{height: 32, width: 130 }} borderRadius="$8" backgroundColor="greenyellow" onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Available now</ButtonText></Button>
                    </View>
                </Card>
                <Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{height: 110 }} backgroundColor="#F3F3F3" borderRadius="$20">
                    <View flexDirection="row" justifyContent="space-between" alignItems="center">
                        <View flexDirection="column">
                            <Heading size="md" mt="$0">Conference Room</Heading>
                            <Text size="sm">Boasting sunset views, long desk and a large TV.</Text>
                        </View>
                        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center"/>
                    </View>
                    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Text size="sm" color="grey">Closes at: 6pm</Text>
                        <Button style={{height: 32, width: 130 }} borderRadius="$8" backgroundColor="lightgrey" onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Not Available</ButtonText></Button>
                    </View>
                </Card>
                <Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{height: 110 }} backgroundColor="#F3F3F3" borderRadius="$20">
                    <View flexDirection="row" justifyContent="space-between" alignItems="center">
                        <View flexDirection="column">
                            <Heading size="md" mt="$0">Meeting Room 1</Heading>
                            <Text size="sm">Boasting sunset views, long desk and a large TV.</Text>
                        </View>
                        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center"/>
                    </View>
                    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Text size="sm" color="grey">Closes at: 6pm</Text>
                        <Button style={{height: 32, width: 130 }} borderRadius="$8" backgroundColor="orangered" onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Fully Booked</ButtonText></Button>
                    </View>
                </Card>
                <Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{height: 110 }} backgroundColor="#F3F3F3" borderRadius="$20">
                    <View flexDirection="row" justifyContent="space-between" alignItems="center">
                        <View flexDirection="column">
                            <Heading size="md" mt="$0">Meeting Room 2</Heading>
                            <Text size="sm">Boasting sunset views, long desk and a large TV.</Text>
                        </View>
                        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center"/>
                    </View>
                    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Text size="sm" color="grey">Closes at: 6pm</Text>
                        <Button style={{height: 32, width: 130 }} borderRadius="$8" backgroundColor="greenyellow" onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Available now</ButtonText></Button>
                    </View>
                </Card>
                <Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{height: 110 }} backgroundColor="#F3F3F3" borderRadius="$20">
                    <View flexDirection="row" justifyContent="space-between" alignItems="center">
                        <View flexDirection="column">
                            <Heading size="md" mt="$0">Conference Room</Heading>
                            <Text size="sm">Boasting sunset views, long desk and a large TV.</Text>
                        </View>
                        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center"/>
                    </View>
                    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Text size="sm" color="grey">Closes at: 6pm</Text>
                        <Button style={{height: 32, width: 130 }} borderRadius="$8" backgroundColor="lightgrey" onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Not Available</ButtonText></Button>
                    </View>
                </Card>
                <Card size="lg" p="$3" variant="elevated" mt="$4" w="$full" style={{height: 110 }} backgroundColor="#F3F3F3" borderRadius="$20">
                    <View flexDirection="row" justifyContent="space-between" alignItems="center">
                        <View flexDirection="column">
                            <Heading size="md" mt="$0">Conference Room</Heading>
                            <Text size="sm">Boasting sunset views, long desk and a large TV.</Text>
                        </View>
                        <Icon as={ChevronRightIcon} w="$6" h="$6" alignSelf="center"/>
                    </View>
                    <View mt="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Text size="sm" color="grey">Closes at: 6pm</Text>
                        <Button style={{height: 32, width: 130 }} borderRadius="$8" backgroundColor="lightgrey" onPress={() => router.push('/bookings')}><ButtonText color="dimgrey" size="sm" fontWeight="light">Not Available</ButtonText></Button>
                    </View>
                </Card>
                
            </View>
        </GuestLayout>
        
          
    )
}

export default Bookings