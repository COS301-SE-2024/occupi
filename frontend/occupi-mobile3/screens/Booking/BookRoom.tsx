import React, { useEffect, useState } from 'react';
import { ScrollView, useColorScheme, TouchableOpacity, View, Text, Image } from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Navbar from '../../components/NavBar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const groupDataInPairs = (data) => {
  const pairs = [];
  for (let i = 0; i < data.length; i += 2) {
    pairs.push(data.slice(i, i + 2));
  }
  return pairs;
};

const BookRoom = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [layout, setLayout] = useState("row");
  const toggleLayout = () => {
    setLayout((prevLayout) => (prevLayout === "row" ? "grid" : "row"));
  };
  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  const backgroundColor = isDarkMode ? 'black' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';
  const data = [
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true },
  ];

  const roomPairs = groupDataInPairs(data);

  return (
    <View style={{ flex: 1, backgroundColor, paddingTop: 20 }}>
      <View style={{ flexDirection: 'column', backgroundColor }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 24, color: textColor }}>Book</Text>
        </View>
        <View style={{ marginHorizontal: 16, marginVertical: 24, width: wp('70%'), backgroundColor: cardBackgroundColor, borderRadius: 15, borderColor: cardBackgroundColor, height: hp('5%'), justifyContent: 'center', paddingHorizontal: 10 }}>
          <Text style={{ fontSize: wp('4%'), color: textColor }}>Quick search for an office</Text>
        </View>
        <Text style={{ paddingHorizontal: 16, fontWeight: 'bold', fontSize: 18, color: textColor }}>Categories</Text>
        <ScrollView horizontal style={{ marginTop: 20, paddingBottom: 20, paddingLeft: 14 }} showsHorizontalScrollIndicator={false}>
          {['Focus', 'Chill', 'Ideas', 'Loud', 'Gamey', 'View'].map((category) => (
            <View key={category} style={{ alignItems: 'center', marginRight: 15 }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: cardBackgroundColor, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="leaf-outline" size={24} color="black" />
              </View>
              <Text style={{ color: textColor, marginTop: 8 }}>{category}</Text>
            </View>
          ))}
        </ScrollView>
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
        <ScrollView style={{ flex: 1, marginTop: 10, paddingHorizontal: 11 }} showsVerticalScrollIndicator={false}>
          {roomPairs.map((pair, index) => (
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              {pair.map((room, idx) => (
                <TouchableOpacity key={idx} style={{ flex: 1, borderWidth: 1, borderColor: cardBackgroundColor, borderRadius: 12, backgroundColor: cardBackgroundColor, marginHorizontal: 4 }} onPress={() => router.push('OfficeDetails')}>
                  <Image style={{ width: '100%', height: 96, borderRadius: 10 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
                  <View style={{ padding: 10 }}>
                    <View>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.title}</Text>
                      <Text style={{ color: textColor, fontSize: 12 }}>{room.description}</Text>
                      <Text style={{ marginVertical: 4 }}>Closes at: {room.Closesat}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TouchableOpacity style={{ width: wp('27%'), height: hp('4%'), justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'greenyellow' }}>
                        <Text style={{ color: 'dimgrey', fontSize: 10, fontWeight: '300' }}>Available: now</Text>
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
        <ScrollView style={{ flex: 1, marginTop: 10, paddingHorizontal: 11 }} showsVerticalScrollIndicator={false}>
          {data.map((room, idx) => (
            <TouchableOpacity key={idx} style={{ flexDirection: 'row', borderWidth: 1, borderColor: cardBackgroundColor, borderRadius: 12, backgroundColor: cardBackgroundColor, marginVertical: 4, height: 160 }} onPress={() => router.push('OfficeDetails')}>
              <Image style={{ width: '50%', height: '100%', borderRadius: 10 }} source={{ uri: 'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png' }} />
              <View style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.title}</Text>
                <View>
                  <Text style={{ color: textColor, fontSize: 12 }}>{room.description}</Text>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={{ marginVertical: 4 }}>Closes at: {room.Closesat}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
                    <TouchableOpacity style={{ width: wp('27%'), height: hp('4%'), justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'greenyellow' }}>
                      <Text style={{ color: 'dimgrey', fontSize: 10, fontWeight: '300' }}>Available: now</Text>
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward-outline" size={30} color={textColor} />
                  </View>
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
