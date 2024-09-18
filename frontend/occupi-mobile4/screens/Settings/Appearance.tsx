import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity,
    useColorScheme,
   
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import {
    Icon,
    View,
    ScrollView,
    Text,
    Image,
    Box
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from '@/components/GradientButton';
import * as SecureStore from 'expo-secure-store';
import { storeTheme, storeAccentColour } from '@/services/securestore';
import { useTheme } from '@/components/ThemeContext';
import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
import Tooltip from '@/components/Tooltip';

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
    const [accentColour, setAccentColour] = useState<string>('greenyellow');
    const [customColor, setCustomColor] = useState<string>('#FFFFFF');
    const { theme, setTheme } = useTheme();
    const colorscheme = useColorScheme();
    const currentTheme = theme === "system" ? colorscheme : theme;

    const onSave = () => {
        storeAccentColour(accentColour);
        storeTheme(theme);
        router.replace('/settings');
    }

    useEffect(() => {
        const getSettings = async () => {
            let accentcolour = await SecureStore.getItemAsync('accentColour');
            setAccentColour(accentcolour);
        };
        getSettings();
    }, []);

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
    // console.log(theme);

    return (
        <ScrollView flex={1} backgroundColor={currentTheme === 'dark' ? 'black' : 'white'} px="$4" pt="$16">
            <View style={styles.header}>
                <Icon
                 testID="back-button"
                    as={Feather}
                    name="chevron-left"
                    size="xl"
                    color={currentTheme === 'dark' ? 'white' : 'black'}
                    onPress={handleBack}
                />
                <Text style={styles.headerTitle} color={currentTheme === 'dark' ? 'white' : 'black'}>
                    Appearance
                </Text>
                <MaterialCommunityIcons
                    name="palette-outline"
                    size={24}
                    color={currentTheme === 'dark' ? 'white' : 'black'}
                    style={styles.icon}
                />
            </View>

            <View mt="$4" flexDirection="column" >
                <Text color={currentTheme === 'dark' ? 'white' : 'black'}>Mode</Text>
                <View p="$8" justifyContent='space-between' flexDirection='row' borderRadius={18} my="$2" height={hp('28%')} backgroundColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
                    <TouchableOpacity  onPress={() => setTheme("light")} style={{ width: wp('25%') }}>
                        <View alignItems='center'>
                            <Image
                                h={hp('18%')}
                                resizeMode='stretch'
                                borderRadius={15}
                                borderColor={theme === 'light' ? accentColour : currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}
                                borderWidth={3}
                                alt="white"
                                source={require('./assets/white.png')}
                            />
                            <Text mt={8} fontWeight={'$light'} color={currentTheme === 'dark' ? 'white' : 'black'}>Light</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTheme("dark")} style={{ width: wp('25%') }}>
                        <View alignItems='center'>
                            <Image
                                h={hp('18%')}
                                resizeMode='stretch'
                                borderColor={theme === 'dark' ? accentColour : currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}
                                borderRadius={15}
                                borderWidth={3}
                                alt="white"
                                source={require('./assets/black.png')}
                            />
                            <Text mt={8} fontWeight={'$light'} color={currentTheme === 'dark' ? 'white' : 'black'}>Dark</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTheme("system")} style={{ width: wp('25%') }}>
                        <View alignItems='center'>
                            <Image
                                h={hp('18%')}
                                resizeMode='stretch'
                                borderColor={theme === 'system' ? accentColour : currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}
                                borderRadius={15}
                                borderWidth={3}
                                alt="white"
                                source={require('./assets/system.png')}
                            />
                            <Text mt={8} fontWeight={'$light'} color={currentTheme === 'dark' ? 'white' : 'black'}>System</Text>
                        </View>
                    </TouchableOpacity>


                </View>
                <Text mt="$2" color={currentTheme === 'dark' ? 'white' : 'black'}>Accent colour
                <Tooltip 
                content="Choose a theme and enjoy a playful experience with Occupi."
                placement="bottom"
                />
                </Text>
                <View p="$5" borderRadius={18} justifyContent='space-between' my="$2" height={hp('18%')} backgroundColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'}>
                    <View flexDirection="row" justifyContent='space-between'>
                        <TouchableOpacity onPress={() => setAccentColour("lightgrey")}>
                            <View borderColor='lightgrey' borderRadius="$full" borderWidth={accentColour === 'lightgrey' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="lightgrey" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentColour("#FF4343")}>
                            <View borderColor='#FF4343' borderRadius="$full" borderWidth={accentColour === '#FF4343' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#FF4343" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentColour("#FFB443")}>
                            <View borderColor='#FFB443' borderRadius="$full" borderWidth={accentColour === '#FFB443' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#FFB443" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentColour("greenyellow")}>
                            <View borderColor='greenyellow' borderRadius="$full" borderWidth={accentColour === 'greenyellow' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="greenyellow" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentColour("#43FF61")}>
                            <View borderColor='#43FF61' borderRadius="$full" borderWidth={accentColour === '#43FF61' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#43FF61" />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View flexDirection="row" justifyContent='space-between'>
                        <TouchableOpacity onPress={() => setAccentColour("#43F4FF")}>
                            <View borderColor='#43F4FF' borderRadius="$full" borderWidth={accentColour === '#43F4FF' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#43F4FF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentColour("#4383FF")}>
                            <View borderColor='#4383FF' borderRadius="$full" borderWidth={accentColour === '#4383FF' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#4383FF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentColour("#AC43FF")}>
                            <View borderColor='#AC43FF' borderRadius="$full" borderWidth={accentColour === '#AC43FF' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#AC43FF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentColour("#FF43F7")}>
                            <View borderColor='#FF43F7' borderRadius="$full" borderWidth={accentColour === '#FF43F7' ? 2 : 0}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="#FF43F7" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAccentColour("purple")}>
                            <View borderColor='purple' borderRadius="$full" borderWidth={accentColour === 'purple' ? 2 : 0} onPress={() => setAccentColour("#FF4343")}>
                                <View w="$12" h="$12" paddingHorizontal={3} borderColor={currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3'} borderRadius="$full" borderWidth={2.5} name="circle" backgroundColor="purple" />
                            </View>
                        </TouchableOpacity>
                    </View >
                </View >
                <Text color={currentTheme === 'dark' ? 'white' : 'black'}>Custom colour
                <Tooltip 
                content="Not satisfied with the appearance? Customize your Occupi experience with our colour picker."
                placement="bottom"
                />
                </Text>
                <View mt="$2" flexDirection="row" alignItems="$center" justifyContent="center">
                    
                    <ColorPicker
                        style={{
                            width: wp('45%'),
                            height: hp('25%'),
                            backgroundColor: currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
                            borderRadius: 2,
                            marginBottom: 40
                        }}
                        value={customColor}
                        onComplete={(color) => setAccentColour(color.hex)}
                    >
                        <HueSlider />
                        <Preview />
                        <Panel1 />
                        
                    </ColorPicker>
                </View>
            </View >
            <View position="relative" mb="$10" left={0} right={0} bottom={36}>
                <GradientButton
                    onPress={onSave}
                    text="Save"
                />
            </View>
        </ScrollView >
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
