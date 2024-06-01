import React from 'react'
import { StatusBar } from 'expo-status-bar';
import Navbar from "../../components/NavBar"
import { 
    StyleSheet, 
    Text, 
    View, 
    Image,
    Card,
    Button,
    ButtonText,
    Icon,
    ArrowRightIcon
    } from '@gluestack-ui/themed';
import { router } from 'expo-router';

const Dashboard = () => {
    return (
        <View pt="$16" px="$4" flex="$1" flexDirection="column" backgroundColor="white">
            <View flexDirection="row" justifyContent="space-between">
                <View>
                    <Text fontSize="$lg" fontWeight="$light">Hi Tina 👋</Text>
                    <Text mt="$4" fontSize="$2xl" fontWeight="$bold">Welcome to Occupi</Text>
                </View>
                <Image
                    alt="logo"
                    p="$10"
                    source={require('../../assets/images/logo-white.png')}//to be replaced with svg
                    style={{ width: 30, height: 30, flexDirection: 'column' }}
                />
            </View>
            <Card size="lg" variant="elevated" mt="$4" w="$full" h="$32" backgroundColor="#F3F3F3" borderRadius="$20">
            </Card>
            <View display="flex" flexDirection="row" rowGap="$4" mt="$1" justifyContent="space-between">
                <Card size="lg" variant="elevated" mt="$4" style={{ width: 170, height: 100 }} backgroundColor="#F3F3F3" borderRadius="$20">
                </Card>
                <Card size="lg" variant="elevated" mt="$4"style={{ width: 170, height: 100 }} backgroundColor="#F3F3F3" borderRadius="$20">
                </Card>
            </View >
            <View flexDirection="row" justifyContent="space-between" mt="$6" mb="$4" h="$8" alignItems="center">
                <Text>Office analytics</Text>
                <Button w="$36" borderRadius="$12" backgroundColor="greenyellow" onPress={() => router.push('/bookings')}><ButtonText color="dimgrey">Book a space</ButtonText><Icon as={ArrowRightIcon} ml="$1" w="$4" h="$4" /></Button>
            </View>
            <Image
                    alt="logo"
                    p="$10"
                    source={require('./assets/graph.png')}
                    style={{ width: "full", height: 260, flexDirection: 'column' }}
                />  

            {/* <Navbar/>      */}
        </View>
          
    )
}

export default Dashboard