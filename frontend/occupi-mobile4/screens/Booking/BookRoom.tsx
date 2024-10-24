import React, { useEffect, useState } from 'react';
import { ScrollView, useColorScheme, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useToast,
  Text,
  View
} from '@gluestack-ui/themed';

import Navbar from '../../components/NavBar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import { Skeleton } from 'moti/skeleton';
import { useTheme } from '@/components/ThemeContext';
import { fetchRooms } from '@/utils/bookings';

const groupDataInPairs = (data) => {
  if (!data) return [];
  const pairs = [];
  for (let i = 0; i < data.length; i += 2) {
    pairs.push(data.slice(i, i + 2));
  }
  return pairs;
};

interface Images {
  highRes: string;
  lowRes: string;
  midRes: string;
  thumbnailRes: string;
}

interface Room {
  _id: string;
  roomName: string;
  roomId: string;
  roomNo: number;
  floorNo: number;
  minOccupancy: number;
  maxOccupancy: number;
  description: string;
  roomImage : Images;
}

const BookRoom = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const colorscheme = useColorScheme();
  const toast = useToast();
  const currentTheme = theme === "system" ? colorscheme : theme;
  const isDarkMode = currentTheme === "dark";
  const [layout, setLayout] = useState("row");
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState("low");
  const [roomData, setRoomData] = useState<Room[]>([]);
  const toggleLayout = () => {
    setLayout((prevLayout) => (prevLayout === "row" ? "grid" : "row"));
  };
 
  const [accentColour, setAccentColour] = useState<string>('greenyellow');

  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };
    getAccentColour();
  }, []);

  useEffect(() => {

    const getRoomData = async () => {
      try {
          const roomData = await fetchRooms('','');
          if (roomData) {
              // console.log(roomData);
              setRoomData(roomData);
          } else {
              setRoomData([]);
          }
      } catch (error) {
          console.error('Error fetching bookings:', error);
      }
      const setResolutionToMid = () => {
        setTimeout(() => {
          setResolution("mid");
        }, 1000);
      };
    
      const setResolutionToHigh = () => {
        setTimeout(() => {
          setResolution("high");
        }, 3000);
      };
      setResolutionToMid();
      setResolutionToHigh();
      setLoading(false);
  };
  getRoomData();
  }, [toast]);




  const backgroundColor = isDarkMode ? 'black' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';

  const roomPairs = groupDataInPairs(roomData);

  const handleRoomSelect = async (room) => {
    await SecureStore.setItemAsync('CurrentRoom', JSON.stringify(room));
    router.push('/office-details');
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor, paddingTop: 60, top: 0 }}>
        <View style={{ flexDirection: 'column', backgroundColor }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 24, color: textColor }}>Book</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: textColor }}>Rooms</Text>
            <TouchableOpacity onPress={toggleLayout}>
              {layout === "row" ? (
                <View style={{ backgroundColor: `${accentColour}`, alignSelf: 'center', padding: 8, borderRadius: 12 }}>
                  <Ionicons name="grid-outline" size={22} color="#2C2C2E" />
                </View>
              ) : (
                <View style={{ backgroundColor: `${accentColour}`, alignSelf: 'center', padding: 8, borderRadius: 12 }}>
                  <Octicons name="rows" size={22} color="#2C2C2E" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {loading === true ? (
                <>
                    <View mt='$4' paddingHorizontal={11}>
                        <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={160} width={"100%"} />
                    </View>
                    <View mt='$2' paddingHorizontal={11}>
                        <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={160} width={"100%"} />
                    </View>
                    <View mt='$2' paddingHorizontal={11}>
                        <Skeleton colorMode={isDarkMode ? 'dark' : 'light'} height={160} width={"100%"} />
                    </View>
                </>
            ) :
        layout === "grid" ? (
          <ScrollView style={{ flex: 1, marginTop: 10, paddingHorizontal: 11, marginBottom: 84 }} showsVerticalScrollIndicator={false}>
            {roomPairs.map((pair, index) => (
              <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                {pair.map((room : Room, idx) => (
                  <TouchableOpacity key={idx} style={{ flex: 1, borderWidth: 1, borderColor: cardBackgroundColor, borderRadius: 12, backgroundColor: cardBackgroundColor, marginHorizontal: 4 }} onPress={() => handleRoomSelect(room)}>
                    <Image style={{ width: '100%', height: 96, borderRadius: 10 }} source={{ uri: resolution === "low" ? room.roomImage.lowRes : resolution === "mid" ? room.roomImage.midRes : room.roomImage.highRes }} />
                    <View style={{ padding: 10 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                      <View>
                        <Text style={{ color: textColor, fontSize: 12 }}>
                          {room.description.length > 20 ? `${room.description.substring(0, 40)}...` : room.description}
                        </Text>
                        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 12, paddingVertical: 3 }}>Floor: {room.floorNo === 0 ? 'G' : room.floorNo}</Text>
                        <View flexDirection="row" alignItems="center">
                          <Octicons name="people" size={18} color={isDarkMode ? '#fff' : '#000'} />
                          <Text style={{ color: isDarkMode ? '#fff' : '#000' }}> {room.minOccupancy} - {room.maxOccupancy}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ bottom: 0, width: wp('27%'), height: hp('4%'), justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: `${accentColour}` }}>
                          <Text style={{ color: 'dimgrey', fontSize: 13 }}>Available: now</Text>
                        </TouchableOpacity>
                        <Ionicons name="chevron-forward-outline" size={30} color={textColor} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView style={{ flex: 1, marginTop: 10, paddingHorizontal: 11, marginBottom: 84 }} showsVerticalScrollIndicator={false}>
            {roomData.map((room, idx) => (
              <TouchableOpacity key={idx} style={{ flexDirection: 'row', borderWidth: 1, borderColor: cardBackgroundColor, borderRadius: 12, backgroundColor: cardBackgroundColor, marginVertical: 4, height: "fit" }} onPress={() => handleRoomSelect(room)}>
                <Image style={{ width: '50%', height: '100%', borderRadius: 10 }} source={{ uri: resolution === "low" ? room.roomImage.thumbnailRes : resolution === "mid" ? room.roomImage.midRes : room.roomImage.highRes }} />
                <View style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                  <View>
                    <Text style={{ color: textColor, fontSize: 12 }}>
                      {room.description.length > 20 ? `${room.description.substring(0, 68)}...` : room.description}
                    </Text>
                    <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 12, paddingVertical: 3 }}>Floor: {room.floorNo === 0 ? "G" : room.floorNo}</Text>
                    <View flexDirection="row" alignItems="center">
                      <Octicons name="people" size={18} color={isDarkMode ? '#fff' : '#000'} />
                      <Text style={{ color: isDarkMode ? '#fff' : '#000' }}> {room.minOccupancy} - {room.maxOccupancy}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={{ width: wp('27%'), height: hp('4%'), justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: `${accentColour}` }}>
                      <Text fontWeight={600} style={{ bottom: 0, color: 'black', fontSize: 13 }}>Available: now</Text>
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward-outline" size={30} color={textColor} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

      </View>
      <Navbar />
    </>
  );
};

export default BookRoom;
