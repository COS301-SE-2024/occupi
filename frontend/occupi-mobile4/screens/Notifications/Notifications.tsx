import Navbar from '../../components/NavBar';
import {
    Text,
    View,
    Image,
    Card,
    Toast,
    useToast,
    ToastTitle,
    Button,
    ButtonText,
} from '@gluestack-ui/themed';
import { StatusBar, useColorScheme, Dimensions } from 'react-native';
import { Entypo } from '@expo/vector-icons';

const Notifications = () => {
    const colorScheme = useColorScheme();
    return (
        <View pt="$20" px="$4" flex={1} flexDirection="column" backgroundColor={colorScheme === 'dark' ? '$black' : '$white'}>
            <View flexDirection='row' justifyContent='space-between'>
                <Text fontWeight="$bold" fontSize={28} color={colorScheme === 'dark' ? '$white' : '$black'}>Notifications</Text>
            <View style={{ backgroundColor: '#ADFF2F', alignItems: 'center', padding: 8, borderRadius: 12 }}>
                <Entypo name="sound-mix" size={26} color="black"style={{ transform: [{ rotate: '90deg' }] }}/>
            </View>
            </View>
            
            <Navbar />
        </View>
    )
}

export default Notifications