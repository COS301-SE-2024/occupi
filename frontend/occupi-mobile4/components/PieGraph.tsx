import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    View, Text
} from '@gluestack-ui/themed';
import * as SecureStore from 'expo-secure-store';
import { PieChart } from "react-native-gifted-charts";
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';

const PieGraph = ({ data, title, x_axis }) => {
    const colorscheme = useColorScheme();
    const { theme } = useTheme();
    const currentTheme = theme === "system" ? colorscheme : theme;
    // console.log(data);
    const labels = currentTheme === 'dark' ? "lightgray" : "#242424";
    const [accentColour, setAccentColour] = useState<string>('greenyellow');
    useEffect(() => {
        const getAccentColour = async () => {
            let accentcolour = await SecureStore.getItemAsync('accentColour');
            setAccentColour(accentcolour);
        };
        getAccentColour();
    }, []);

    const pieData = [
        {value: 70, color: '#177AD5'},
        {value: 30, color: 'lightgray'}
    ];

    return (
        <View my="$2" w="$full" flexDirection='column' alignItems='center' justifyContent='space-around'>
            <Text underline color={currentTheme === 'dark' ? "$white" : "$black"}>{title}</Text>
            <PieChart
                donut
                innerRadius={80}
                data={pieData}
                centerLabelComponent={() => {
                    return <Text style={{fontSize: 30}}>70%</Text>;
                    }}
            />
            <Text color={currentTheme === 'dark' ? "$white" : "$black"}>{x_axis}</Text>
        </View>
    )
}

export default PieGraph;