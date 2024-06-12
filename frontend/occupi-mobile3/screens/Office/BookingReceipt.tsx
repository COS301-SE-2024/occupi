import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import Barcode from 'react-native-barcode-builder';

const BookingReceipt = () => {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();
  const route = useRoute();
  const { slot, attendees } = route.params;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    animatePulse();
  }, [selectedIndex]);

  const animatePulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const handleSegmentChange = (event) => {
    setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
  };

  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { padding: 20px; }
            .title { font-size: 24px; font-weight: bold; }
            .details { margin-top: 20px; }
            .barcode { text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">The HDMI room</div>
            <div class="details">
              <p>🏃 Fast 📺 OLED 👥 5 people 🏢 Floor 7</p>
              <p>Check in: 07:30 Check out: 10:30</p>
              <p>Selected Slot: ${slot}</p>
              <p>Host: Sabrina Carpenter, Chief Executive Officer</p>
            </div>
            <div class="barcode">
              <img src="data:image/png;base64,${await generateBarcodeBase64('ABC-abc-1234')}" />
              <p>ABC-abc-1234</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    return uri;
  };

  const handleDownload = async () => {
    try {
      const pdfUri = await generatePDF();
      if (pdfUri) {
        const permission = await FileSystem.getPermissionsAsync();
        if (permission.granted) {
          const newPath = `${FileSystem.documentDirectory}BookingReceipt.pdf`;
          await FileSystem.copyAsync({ from: pdfUri, to: newPath });
          await Sharing.shareAsync(newPath);
        } else {
          Alert.alert('Permission Denied', 'You need to grant storage permissions to download the PDF');
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const generateBarcodeBase64 = async (value) => {
    return new Promise((resolve, reject) => {
      // You need to implement barcode generation and convert to base64 here
      // For example, using node-barcode or similar library to generate barcode base64 string
      // This is a placeholder function
      resolve('barcode_base64_string');
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#fff' }}>
      {/* Top Section */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: wp('5%') }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={wp('6%')} color={isDarkMode ? 'white' : 'black'} />
        </TouchableOpacity>
        <Text style={{ fontSize: wp('5%'), color: isDarkMode ? '#fff' : '#000', marginLeft: wp('2.5%') }}>Booking details</Text>
      </View>

      {/* Segmented Control */}
      <SegmentedControl
        values={['Booking details', 'Attendees', 'Receipt']}
        selectedIndex={selectedIndex}
        onChange={handleSegmentChange}
        style={{ margin: wp('5%') }}
      />

      {selectedIndex === 2 && (
        <View>
          {/* Office Image and Details */}
          <Image source={{ uri: 'https://cdn-bnokp.nitrocdn.com/QNoeDwCprhACHQcnEmHgXDhDpbEOlRHH/assets/images/optimized/rev-15fa1b1/www.decorilla.com/online-decorating/wp-content/uploads/2022/03/Modern-Office-Interior-with-Open-Floor-Plan-1024x683.jpeg' }} style={{ width: '100%', height: hp('30%') }} />
          <View style={{ padding: wp('5%') }}>
            <Text style={{ fontSize: wp('6%'), fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }}>The HDMI room</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: hp('1%') }}>
              <Text>🏃 Fast</Text>
              <Text> 📺 OLED</Text>
              <Text> 👥 5 people</Text>
              <Text> 🏢 Floor 7</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ backgroundColor: 'green', padding: wp('2.5%'), borderRadius: wp('1%') }}>
                <Text style={{ color: '#fff', fontSize: wp('4%') }}>Check in: 07:30</Text>
              </View>
              <View style={{ backgroundColor: 'red', padding: wp('2.5%'), borderRadius: wp('1%') }}>
                <Text style={{ color: '#fff', fontSize: wp('4%') }}>Check out: 10:30</Text>
              </View>
            </View>
          </View>

          {/* Host Details */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: wp('5%') }}>
            <Image source={{ uri: 'https://example.com/host_image_url.jpg' }} style={{ width: wp('12.5%'), height: wp('12.5%'), borderRadius: wp('6.25%') }} />
            <View style={{ marginLeft: wp('2.5%') }}>
              <Text style={{ fontSize: wp('4%'), fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }}>Sabrina Carpenter</Text>
              <Text style={{ fontSize: wp('3.5%'), color: 'grey' }}>Chief Executive Officer</Text>
            </View>
          </View>

          {/* Barcode */}
          <View style={{ alignItems: 'center', padding: wp('5%') }}>
            <Barcode value="ABC-abc-1234" format="CODE128" />
            <Text style={{ fontSize: wp('5%'), color: isDarkMode ? '#fff' : '#000' }}>ABC-abc-1234</Text>
          </View>

          {/* Download Receipt Button */}
          <TouchableOpacity style={{ margin: wp('5%'), borderRadius: wp('1%') }} onPress={handleDownload}>
            <LinearGradient
              colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ padding: wp('4%'), alignItems: 'center', borderRadius: wp('1%') }}
            >
              <Text style={{ color: '#fff', fontSize: wp('4%') }}>Download receipt as PDF</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {selectedIndex === 1 && (
        <View>
          {/* Attendees Component */}
          <Text style={{ fontSize: wp('5%'), color: isDarkMode ? '#fff' : '#000' }}>Attendees details go here...</Text>
        </View>
      )}

      {selectedIndex === 0 && (
        <View>
          {/* Booking Details Component */}
          <Text style={{ fontSize: wp('5%'), color: isDarkMode ? '#fff' : '#000' }}>Booking details go here...</Text>
        </View>
      )}
    </View>
  );
};

export default BookingReceipt;
