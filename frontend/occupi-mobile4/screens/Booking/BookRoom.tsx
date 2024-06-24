import React, { useEffect, useState } from 'react';
import { ScrollView, useColorScheme, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Toast,
  ToastTitle,
  useToast,
  View
} from '@gluestack-ui/themed';

import Navbar from '../../components/NavBar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const groupDataInPairs = (data) => {
  if (!data) return [];
  const pairs = [];
  for (let i = 0; i < data.length; i += 2) {
    pairs.push(data.slice(i, i + 2));
  }
  return pairs;
};

interface Room {
  _id: string;
  roomName: string;
  roomId: string;
  roomNo: number;
  floorNo: number;
  minOccupancy: number;
  maxOccupancy: number;
  description: string;
}

const BookRoom = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const toast = useToast();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [layout, setLayout] = useState("row");
  const [roomData, setRoomData] = useState<Room[]>([]);
  const toggleLayout = () => {
    setLayout((prevLayout) => (prevLayout === "row" ? "grid" : "row"));
  };

  useEffect(() => {
    const fetchAllRooms = async () => {
      console.log("heree");
      try {
        const response = await fetch('https://dev.occupi.tech/api/view-rooms')
        const data = await response.json();
        if (response.ok) {
          setRoomData(data.data || []); // Ensure data is an array
          // toast.show({
          //   placement: 'top',
          //   render: ({ id }) => {
          //     return (
          //       <Toast nativeID={id} variant="accent" action="success">
          //         <ToastTitle>{data.message}</ToastTitle>
          //       </Toast>
          //     );
          //   },
          // });
        } else {
          console.log(data);
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <Toast nativeID={id} variant="accent" action="error">
                  <ToastTitle>{data.error.message}</ToastTitle>
                </Toast>
              );
            },
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="error">
                <ToastTitle>Network Error: {error.message}</ToastTitle>
              </Toast>
            );
          },
        });
      }
    };
    fetchAllRooms();
  }, [toast]);

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const backgroundColor = isDarkMode ? 'black' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';

  const roomPairs = groupDataInPairs(roomData);

  return (
    <View style={{ flex: 1, backgroundColor, paddingTop: 60 }}>
      <View style={{ flexDirection: 'column', backgroundColor }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 24, color: textColor }}>Book</Text>
        </View>
        <View style={{ marginHorizontal: 16, marginVertical: 24, width: wp('92%'), backgroundColor: cardBackgroundColor, borderRadius: 15, borderColor: cardBackgroundColor, height: hp('5%'), justifyContent: 'center', paddingHorizontal: 10 }}>
          <Text style={{ fontSize: wp('4%'), color: textColor }}>Quick search for an office</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: textColor }}>Rooms</Text>
          <TouchableOpacity onPress={toggleLayout}>
            {layout === "row" ? (
              <View style={{ backgroundColor: '#ADFF2F', alignSelf: 'center', padding: 8, borderRadius: 12 }}>
                <Ionicons name="grid-outline" size={22} color="#2C2C2E" />
              </View>
            ) : (
              <View style={{ backgroundColor: '#ADFF2F', alignSelf: 'center', padding: 8, borderRadius: 12 }}>
                <Octicons name="rows" size={22} color="#2C2C2E" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {layout === "grid" ? (
        <ScrollView style={{ flex: 1, marginTop: 10, paddingHorizontal: 11, marginBottom:84 }} showsVerticalScrollIndicator={false}>
          {roomPairs.map((pair, index) => (
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              {pair.map((room, idx) => (
                <TouchableOpacity key={idx} style={{ flex: 1, borderWidth: 1, borderColor: cardBackgroundColor, borderRadius: 12, backgroundColor: cardBackgroundColor, marginHorizontal: 4 }} onPress={() => router.push({ pathname: '/office-details', params: { roomData: JSON.stringify(room) } })}>
                  <Image style={{ width: '100%', height: 96, borderRadius: 10 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                    <View>
                      <Text style={{ color: textColor, fontSize: 12 }}>
                        {room.description.length > 20 ? `${room.description.substring(0, 40)}...` : room.description}
                      </Text>
                      <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 12, paddingVertical: 3 }}>Floor: {room.floorNo === 0 ? 'G' : room.floorNo}</Text>
                      <View flexDirection="$row" alignItems="$center">
                        <Octicons name="people" size={18} color={isDarkMode ? '#fff' : '#000'} />
                        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}> {room.minOccupancy} - {room.maxOccupancy}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TouchableOpacity style={{ bottom: 0, width: wp('27%'), height: hp('4%'), justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'greenyellow' }}>
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
        <ScrollView style={{ flex: 1, marginTop: 10, paddingHorizontal: 11, marginBottom:84 }} showsVerticalScrollIndicator={false}>
          {roomData.map((room, idx) => (
            <TouchableOpacity key={idx} style={{ flexDirection: 'row', borderWidth: 1, borderColor: cardBackgroundColor, borderRadius: 12, backgroundColor: cardBackgroundColor, marginVertical: 4, height: 160 }} onPress={() => router.push({ pathname: '/office-details', params: { roomData: JSON.stringify(room) } })}>
              <Image style={{ width: '50%', height: '100%', borderRadius: 10 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
              <View style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.roomName}</Text>
                <View>
                  <Text style={{ color: textColor, fontSize: 12 }}>
                    {room.description.length > 20 ? `${room.description.substring(0, 68)}...` : room.description}
                  </Text>
                  <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 12, paddingVertical: 3 }}>Floor: {room.floorNo === 0 ? "G" : room.floorNo}</Text>
                  <View flexDirection="$row" alignItems="$center">
                    <Octicons name="people" size={18} color={isDarkMode ? '#fff' : '#000'} />
                    <Text style={{ color: isDarkMode ? '#fff' : '#000' }}> {room.minOccupancy} - {room.maxOccupancy}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TouchableOpacity style={{ width: wp('27%'), height: hp('4%'), justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'greenyellow' }}>
                    <Text style={{ bottom: 0, color: 'dimgrey', fontSize: 13 }}>Available: now</Text>
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward-outline" size={30} color={textColor} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <Navbar style={{ position: 'absolute', bottom: 0, width: '100%' }} />
    </View>
  );
};

export default BookRoom;
