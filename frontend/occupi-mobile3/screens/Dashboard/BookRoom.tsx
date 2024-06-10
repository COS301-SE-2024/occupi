import { React, useEffect, useState } from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import { Icon, View, Text, Input, InputField, InputSlotButton, Button, ButtonText, Image } from '@gluestack-ui/themed';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/NavBar';

const groupDataInPairs = (data) => {
  const pairs = [];
  for (let i = 0; i < data.length; i += 2) {
    pairs.push(data.slice(i, i + 2));
  }
  return pairs;
};

const BookRoom = () => {
  const colorScheme = useColorScheme();

  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
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
    <View pt="$16" px="$5" style={{ flex: 1, backgroundColor }}>
      <View style={{ flexDirection: 'column', backgroundColor }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text fontWeight="$bold" fontSize="$24" color={textColor}>Book</Text>
        </View>
        <Input my="$6" w={wp('70%')} backgroundColor={cardBackgroundColor} borderRadius="$15" borderColor={cardBackgroundColor} h={hp('5%')}>
          <InputField
            placeholder="Quick search for an office"
            fontSize={wp('4%')}
            type="text"
            returnKeyType="done"
          />
        </Input>
        <Text fontWeight="$bold" fontSize="$18" color={textColor}>Categories</Text>
        <ScrollView horizontal style={{ marginTop: 20, paddingBottom: 20 }} showsHorizontalScrollIndicator={false}>
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
                  backgroundColor: cardBackgroundColor,
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
      </View>
      <ScrollView style={{ flex: 1, marginTop: 20 }} showsVerticalScrollIndicator={false}>
        {roomPairs.map((pair, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            {pair.map((room) => (
              <View style={{
                flex: 1,
                borderWidth: 1,
                borderColor: cardBackgroundColor,
                borderRadius: 12,
                backgroundColor: cardBackgroundColor,
                marginHorizontal: 4,
              }}>
                <Image
                  w="$full"
                  h="$24"
                  alt="image"
                  borderRadius="$10"
                  source={'https://content-files.shure.com/OriginFiles/BlogPosts/best-layouts-for-conference-rooms/img5.png'}
                />
                <View
                  key={room.title}
                  style={{


                    padding: 10,


                  }}
                >
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{room.title}</Text>
                    <Text style={{ color: textColor }} fontSize="$12">{room.description}</Text>
                    <Text my="$1">Closes at: {room.Closesat}</Text>
                  </View>
                  <View flexDirection="$row" alignItems="$center" justifyContent="space-between">
                    <Button w={wp('27%')} h={hp('4%')} p="$0" borderRadius="$12" backgroundColor="greenyellow">
                      <ButtonText color="dimgrey" fontSize="$10" fontWeight="$light">Available: now</ButtonText>
                    </Button>
                    <Ionicons name="chevron-forward-outline" size={30} color={textColor} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <Navbar style={{ position: 'absolute', bottom: 0, width: '100%' }} />
    </View>
  );
};

export default BookRoom;
