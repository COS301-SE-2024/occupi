import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import {
    Icon,
    View,
    Text,
    Image,
    Box
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { useColorScheme, Switch } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';
import * as SecureStore from 'expo-secure-store';

const FONTS = {
    h3: { fontSize: 20, fontWeight: 'bold' },
    body3: { fontSize: 16 },
};

const SIZES = {
    padding: 16,
    base: 8,
    radius: 8,
};

const Appearance = () => {
    let colorScheme = useColorScheme();
    //retrieve user settings ad assign variables accordingly
    const onSave = () => {
        //integration here
    };
    const [accentColour, setAccentColour] = useState<string>('greenyellow');

    useEffect(() => {
        const getAccentColour = async () => {
            let accentcolour = await SecureStore.getItemAsync('accentColour');
            setAccentColour(accentcolour);
        };
        getAccentColour();
    }, []);

    console.log(accentColour);

    const setAccentcolour = async (value) => {
        setAccentColour(value);
        await SecureStore.setItemAsync('accentColour', value);
    }
    // setAccentcolour();

    const handleBack = () => {
        // if (isSaved === false) {
        //     Alert.alert(
        //         'Save Changes',
        //         'You have unsaved changes. Would you like to save them?',
        //         [
        //             {
        //                 text: 'Leave without saving',
        //                 onPress: () => router.back(),
        //                 style: 'cancel',
        //             },
        //             { text: 'Save', onPress: () => onSave() },
        //         ],
        //         { cancelable: false }
        //     );
        // }
        // else {
            router.back();
        // }
    }

    return (
        <View flex={1} backgroundColor={colorScheme === 'dark' ? 'black' : 'white'} px="$4" pt="$16">
            <View style={styles.header}>
                <Icon
                    as={Feather}
                    name="chevron-left"
                    size="xl"
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                    onPress={handleBack}
                />
                <Text style={styles.headerTitle} color={colorScheme === 'dark' ? 'white' : 'black'}>
                    Appearance
                </Text>
                <MaterialCommunityIcons
                    name="palette-outline"
                    size={24}
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                    style={styles.icon}
                />
            </View>

            <View mt="$4" flexDirection="column">
                <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Mode</Text>
                <View borderRadius={18} my="$2" height={hp('28%')} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>

                    <Image
                        h={hp('24%')}
                        w="30%"
                        resizeMode='stretch'
                        borderRadius="$20"
                        alt="white"
                        source={require('./assets/white.png')}
                    />

                </View>
                <Text mt="$2" color={colorScheme === 'dark' ? 'white' : 'black'}>Accent colour</Text>
                <View p="$5" borderRadius={18} justifyContent='space-between' my="$2" height={hp('18%')} backgroundColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
                    <View flexDirection="row" justifyContent='space-between'>
                        <TouchableOpacity onPress={() => setAccentcolour("lightgrey")}>
                            <View borderColor='lightgrey' borderRadius="$full" borderWidth={accentColour === 'lightgrey' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="lightgrey" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentcolour("#FF4343")}>
                            <View borderColor='#FF4343' borderRadius="$full" borderWidth={accentColour === '#FF4343' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#FF4343" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentcolour("#FFB443")}>
                            <View borderColor='#FFB443' borderRadius="$full" borderWidth={accentColour === '#FFB443' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#FFB443" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentcolour("greenyellow")}>
                            <View borderColor='greenyellow' borderRadius="$full" borderWidth={accentColour === 'greenyellow' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="greenyellow" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentcolour("#43FF61")}>
                            <View borderColor='#43FF61' borderRadius="$full" borderWidth={accentColour === '#43FF61' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#43FF61" />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View flexDirection="row" justifyContent='space-between'>
                        <TouchableOpacity onPress={() => setAccentcolour("#43F4FF")}>
                            <View borderColor='#43F4FF' borderRadius="$full" borderWidth={accentColour === '#43F4FF' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#43F4FF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentcolour("#4383FF")}>
                            <View borderColor='#4383FF' borderRadius="$full" borderWidth={accentColour === '#4383FF' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#4383FF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentcolour("#AC43FF")}>
                            <View borderColor='#AC43FF' borderRadius="$full" borderWidth={accentColour === '#AC43FF' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#AC43FF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentcolour("#FF43F7")}>
                            <View borderColor='#FF43F7' borderRadius="$full" borderWidth={accentColour === '#FF43F7' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#FF43F7" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentcolour("purple")}>
                            <View borderColor='purple' borderRadius="$full" borderWidth={accentColour === 'purple' ? 2 : 0} onPress={() => setAccentcolour("#FF4343")}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="purple" />
                            </View>
                        </TouchableOpacity>
                    </View >
                </View >
                <Text mt="$2" color={colorScheme === 'dark' ? 'white' : 'black'}>Or enter a custom colour</Text>
                <View mt="$2" flexDirection="row" alignItems="$center">
                    <Text color={colorScheme === 'dark' ? 'white' : 'black'}>Custom colour:   </Text>
                    <TextInput
                        style={{
                            backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
                            borderColor: colorScheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
                            borderRadius: 12,
                            padding: 10,
                            color: colorScheme ? "#fff" : "#000",
                        }}
                        width={wp('40%')}
                        height={hp('5%')}
                        placeholder="#FFFFFF"
                        placeholderTextColor={colorScheme ? "#999" : "#666"}
                    // onChangeText={setEmail}
                    />
                </View>
            </View >
            <View position="absolute" left={0} right={0} bottom={36}>
                <GradientButton
                    onPress={onSave}
                    text="Save"
                />
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SIZES.padding,
    },
    icon: {
        marginRight: SIZES.base,
    },
    headerTitle: {
        ...FONTS.h3,
    },

});

export default Appearance;
