import React, { useState, useEffect } from 'react';
import { Pressable, SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image, Dimensions, useColorScheme } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/components/ThemeContext';
import Tooltip from '@/components/Tooltip';
import ColorPicker, { Preview, HueSlider, Panel1 } from 'reanimated-color-picker';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Appearance = () => {
  const [accentColour, setAccentColour] = useState('greenyellow');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const { theme, setTheme } = useTheme();
  const colorScheme = useColorScheme();
  const currentTheme = theme === "system" ? colorScheme : theme;

  const onSave = () => {
    SecureStore.setItemAsync('accentColour', accentColour);
    SecureStore.setItemAsync('theme', theme);
    router.replace('/settings');
  };

  useEffect(() => {
    const getSettings = async () => {
      let savedAccentColour = await SecureStore.getItemAsync('accentColour');
      if (savedAccentColour) setAccentColour(savedAccentColour);
    };
    getSettings();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme === 'dark' ? '#000' : '#FFF' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={currentTheme === 'dark' ? ['#1A1A1A', '#000'] : ['#F0F0F0', '#FFF']}
          style={{
            paddingTop: hp('3%'),
            paddingHorizontal: wp('4%'),
            paddingBottom: hp('1%'),
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: hp('2%'),
          }}>
            <Pressable onPress={() => router.back()} >
              <Feather name="chevron-left" size={30} color={currentTheme === 'dark' ? 'white' : 'black'} />
            </Pressable>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: currentTheme === 'dark' ? 'white' : 'black',
            }}>
              Appearance
            </Text>
            <MaterialCommunityIcons name="palette-outline" size={30} color={currentTheme === 'dark' ? 'white' : 'black'} />
          </View>
        </LinearGradient>

        <View style={{ padding: wp('4%'), alignItems: 'center' }}>
          <Text style={{
            fontSize: wp('5%'),
            fontWeight: 'bold',
            marginBottom: hp('1%'),
            color: currentTheme === 'dark' ? '#FFF' : '#000',
          }}>Theme</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity onPress={() => setTheme("light")} style={{ width: wp('28%') }}>
              <View style={{ alignItems: 'center' }}>
                <Image
                  style={{
                    height: hp('18%'),
                    width: '100%',
                    resizeMode: 'stretch',
                    borderRadius: 15,
                    borderWidth: 3,
                    borderColor: theme === 'light' ? accentColour : currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
                  }}
                  source={require('./assets/white.png')}
                />
                <Text style={{ marginTop: 8, fontWeight: '400', color: currentTheme === 'dark' ? 'white' : 'black' }}>Light</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTheme("dark")} style={{ width: wp('28%') }}>
              <View style={{ alignItems: 'center' }}>
                <Image
                  style={{
                    height: hp('18%'),
                    width: '100%',
                    resizeMode: 'stretch',
                    borderRadius: 15,
                    borderWidth: 3,
                    borderColor: theme === 'dark' ? accentColour : currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
                  }}
                  source={require('./assets/black.png')}
                />
                <Text style={{ marginTop: 8, fontWeight: '400', color: currentTheme === 'dark' ? 'white' : 'black' }}>Dark</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTheme("system")} style={{ width: wp('28%') }}>
              <View style={{ alignItems: 'center' }}>
                <Image
                  style={{
                    height: hp('18%'),
                    width: '100%',
                    resizeMode: 'stretch',
                    borderRadius: 15,
                    borderWidth: 3,
                    borderColor: theme === 'system' ? accentColour : currentTheme === 'dark' ? '#2C2C2E' : '#F3F3F3',
                  }}
                  source={require('./assets/system.png')}
                />
                <Text style={{ marginTop: 8, fontWeight: '400', color: currentTheme === 'dark' ? 'white' : 'black' }}>System</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={{
            fontSize: wp('5%'),
            fontWeight: 'bold',
            marginTop: hp('2%'),
            marginBottom: hp('1%'),
            color: currentTheme === 'dark' ? '#FFF' : '#000',
          }}>Accent Color
          <Tooltip content="Choose a theme color for a personalized experience." placement="bottom" /></Text>

          

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginVertical: hp('2%'),
            padding: wp('4%'),
            backgroundColor: currentTheme === 'dark' ? '#1A1A1A' : '#F0F0F0',
            borderRadius: 15,
          }}>
            {['lightgrey', '#FF4343', '#FFB443', 'greenyellow', '#43FF61', '#43F4FF', '#4383FF', '#AC43FF', '#FF43F7', 'purple'].map(color => (
              <Pressable key={color} onPress={() => setAccentColour(color)} style={{
                width: wp('12%'),
                height: wp('12%'),
                backgroundColor: color,
                borderRadius: wp('6%'),
                borderWidth: accentColour === color ? 3 : 0,
                borderColor: accentColour,
                marginBottom: hp('2%'),
              }} />
            ))}
          </View>

          <Text style={{
            fontSize: wp('5%'),
            fontWeight: 'bold',
            marginTop: hp('2%'),
            marginBottom: hp('1%'),
            color: currentTheme === 'dark' ? '#FFF' : '#000',
          }}>Custom Color
          <Tooltip content="Create your unique color with our advanced color picker." placement="bottom" /></Text>

          

          <View style={{
            marginVertical: 20,
            backgroundColor: currentTheme === 'dark' ? '#1A1A1A' : '#F0F0F0',
            borderRadius: 15,
            padding: 10,
            width: wp('90%'),
          }}>
            <ColorPicker
              style={{ width: '100%', height: hp('25%') }}
              value={customColor}
              onComplete={(color) => setAccentColour(color.hex)}
            >
              <Preview />
              <HueSlider />
              <Panel1 />
            </ColorPicker>
          </View>
        </View>

        <Pressable onPress={onSave} style={{
          marginHorizontal: wp('4%'),
          marginTop: hp('4%'),
          paddingVertical: hp('2%'),
          borderRadius: 30,
          alignItems: 'center',
          backgroundColor: accentColour,
        }}>
          <Text style={{ fontSize: wp('4.5%'), fontWeight: 'bold', color: '#FFF' }}>Save Changes</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Appearance;
