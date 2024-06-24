import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, FlatList, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const BookingDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { slot } = route.params;

    const [attendees, setAttendees] = useState(['abcd@gmail.com']);
    const [email, setEmail] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const pulseAnim = new Animated.Value(1);

    const animatePulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    };

    const addAttendee = () => {
        if (email && !attendees.includes(email)) {
            setAttendees([...attendees, email]);
            setEmail('');
        }
    };

    const removeAttendee = (emailToRemove) => {
        setAttendees(attendees.filter(email => email !== emailToRemove));
    };

    const renderAttendee = ({ item }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: wp('2.5%'), borderBottomWidth: wp('0.25%'), borderColor: 'grey' }}>
            <Text style={{ fontSize: wp('4%'), color: isDarkMode ? '#fff' : '#000' }}>{item}</Text>
            <TouchableOpacity onPress={() => removeAttendee(item)}>
                <Ionicons name="close" size={wp('6%')} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
        </View>
    );

    const steps = ['Booking details', 'Attendees', 'Receipt'];

    const handleSegmentPress = (index) => {
        setCurrentStep(index);
        if (index === 0) animatePulse();
    };

    useEffect(() => {
        if (currentStep === 0) animatePulse();
    }, [currentStep]);

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#fff' }}>
            {/* Top Section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: wp('5%') }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={wp('6%')} color={isDarkMode ? 'white' : 'black'} />
                </TouchableOpacity>
                <Text style={{ fontSize: wp('5%'), color: isDarkMode ? '#fff' : '#000', marginLeft: wp('2.5%') }}>{steps[currentStep]}</Text>
            </View>

            {/* Segmented Control */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: wp('5%') }}>
                {steps.map((step, index) => (
                    <TouchableOpacity key={index} onPress={() => handleSegmentPress(index)}>
                        <Animated.Text style={[{ fontSize: wp('4%'), color: 'grey' }, currentStep === index && { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000', transform: [{ scale: pulseAnim }] }]}>
                            {step}
                        </Animated.Text>
                    </TouchableOpacity>
                ))}
            </View>

            {currentStep === 0 && (
                <View>
                    {/* Office Image and Details */}
                    <Image source={{ uri: 'https://cdn-bnokp.nitrocdn.com/QNoeDwCprhACHQcnEmHgXDhDpbEOlRHH/assets/images/optimized/rev-15fa1b1/www.decorilla.com/online-decorating/wp-content/uploads/2022/03/Modern-Office-Interior-with-Open-Floor-Plan-1024x683.jpeg' }} style={{ width: '100%', height: hp('30%') }} />
                    <View style={{ padding: wp('5%') }}>
                        <Text style={{ fontSize: wp('6%'), fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }}>The HDMI room</Text>
                        <Text style={{ fontSize: wp('4%'), marginTop: hp('1%'), color: isDarkMode ? '#fff' : '#000' }}>🏃 Fast  📺 OLED  👥 5 people  🏢 Floor 7</Text>
                        <Text style={{ fontSize: wp('4%'), marginTop: hp('1%'), color: isDarkMode ? '#fff' : '#000' }}>Check in: 07:30  Check out: 10:30</Text>
                        <Text style={{ fontSize: wp('4%'), marginTop: hp('1%'), color: isDarkMode ? '#fff' : '#000' }}>Selected Slot: {slot}</Text>
                    </View>
                    <TouchableOpacity style={{ margin: wp('5%'), borderRadius: wp('1%') }} onPress={() => handleSegmentPress(1)}>
                        <LinearGradient
                            colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ padding: wp('4%'), alignItems: 'center', borderRadius: wp('1%') }}
                        >
                            <Text style={{ color: '#fff', fontSize: wp('4%') }}>Confirm booking</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

            {currentStep === 1 && (
                <View>
                    <TextInput
                        style={{ borderWidth: wp('0.25%'), borderColor: 'grey', padding: wp('2.5%'), margin: wp('5%'), borderRadius: wp('1%'), color: isDarkMode ? '#fff' : '#000' }}
                        placeholder="Enter attendee's email or employee id"
                        placeholderTextColor={isDarkMode ? '#bbb' : '#888'}
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TouchableOpacity onPress={addAttendee} style={{ backgroundColor: 'green', padding: wp('2.5%'), alignItems: 'center', borderRadius: wp('1%'), marginHorizontal: wp('5%'), marginBottom: wp('5%') }}>
                        <Ionicons name="add" size={wp('6%')} color="white" />
                    </TouchableOpacity>
                    <FlatList
                        data={attendees}
                        renderItem={renderAttendee}
                        keyExtractor={(item) => item}
                        style={{ marginHorizontal: wp('5%') }}
                    />
                    <TouchableOpacity style={{ margin: wp('5%'), borderRadius: wp('1%') }} onPress={() => handleSegmentPress(2)}>
                        <LinearGradient
                            colors={['#614DC8', '#86EBCC', '#B2FC3A', '#EEF060']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ padding: wp('4%'), alignItems: 'center', borderRadius: wp('1%') }}
                        >
                            <Text style={{ color: '#fff', fontSize: wp('4%') }}>Send invites</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={{ color: 'blue', textAlign: 'center', marginTop: wp('2.5%'), fontSize: wp('4%') }}>Skip this step</Text>
                    </TouchableOpacity>
                </View>
            )}

            {currentStep === 2 && (
                <View style={{ padding: wp('5%') }}>
                    <Text style={{ fontSize: wp('4%'), color: isDarkMode ? '#fff' : '#000' }}>Receipt details go here...</Text>
                </View>
            )}
        </View>
    );
};

export default BookingDetails;
