import { React, useEffect, useState } from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import { Icon, View, Text, Input, InputField, InputSlot } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/NavBar';

const BookRoom = () => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  const backgroundColor = isDarkMode ? '#1C1C1E' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#F3F3F3';
  const data = [
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true},
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true},
    { title: 'HDMI Room', description: 'Boasting sunset views, long desks, and comfy chairs', Closesat: '7pm', available: true},
  ];

  return (
    <View pt="$16" px="$5" h={hp('100%')} flexDirection="column" backgroundColor={backgroundColor}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text fontWeight="$bold" fontSize="$24" color={textColor}>Book</Text>
      </View>
      <Input my="$6" w={wp('70%')} backgroundColor={isDarkMode ? '#5A5A5A' : 'white'} borderRadius="$15" borderColor="#5A5A5A" h={hp('5%')}>
        <InputField
            placeholder="Email"
            fontSize={wp('4%')}
            type="text"
            returnKeyType="done"
        />
        </Input>
        <Text fontWeight="$bold" fontSize="$18" color={textColor}>Categories</Text>
      <ScrollView horizontal style={{ marginTop: 20, top:0 }} showsHorizontalScrollIndicator={false}>
        {['Focus', 'Chill', 'Ideas', 'Loud', 'Gamey', 'View'].map((category) => (
          <View
            key={category}
            style={{
              alignItems: 'center',
              marginRight: 15,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon as={Ionicons} name="leaf-outline" size={24} color="black" />
            </View>
            <Text color={textColor} mt="$2">{category}</Text>
          </View>
        ))}
      </ScrollView>
      <Text fontWeight="$bold" fontSize="$18" color={textColor}>Rooms</Text>
      <ScrollView style={{ marginTop: 20, top:0 }} showsVerticalScrollIndicator={false}>
        {/* Rooms */}
        {data.map((room) => (
          <View
            key={room.title}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              padding: 15,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
            }}
            w={wp('40%')}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{room.title}</Text>
              <Text style={{ color: room.available === 'Available now' ? 'green' : 'red' }}>{room.available}</Text>
            </View>
            <Icon as={Ionicons} name="chevron-forward-outline" size={24} color="black" />
          </View>
        ))}
      </ScrollView>
      <Navbar />
    </View>
  );
};

export default BookRoom;
