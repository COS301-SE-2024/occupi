import React, { useEffect, useState } from 'react';
import {
    View, Text
} from '@gluestack-ui/themed';
import * as SecureStore from 'expo-secure-store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PieChart } from "react-native-gifted-charts";
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';

const PieGraph = ({ data, title }) => {
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
        {value: data, color: accentColour},
        {value: 100-data, color: 'lightgray'}
    ];

    return (
        <View my="$2" w="$full" flexDirection='column' alignItems='center' justifyContent='space-around'>
            <Text underline color={currentTheme === 'dark' ? "$white" : "$black"}>{title}</Text>
            <View w="$1/2" flexDirection='row' justifyContent='space-between' my={6}>
                <View flexDirection='row' alignItems='center'>
                    <FontAwesome name="circle" size={12} color={accentColour} /><Text color={currentTheme === 'dark' ? "white" : "black"}>  in office</Text>
                </View>
                <View ml="$3" flexDirection='row' alignItems='center'>
                    <FontAwesome name="circle" size={12} color="lightgray" /><Text color={currentTheme === 'dark' ? "white" : "black"}>  out of office</Text>
                </View>
            </View>
            <PieChart
                donut
                innerRadius={80}
                data={pieData}
                innerCircleColor={currentTheme === 'dark' ? '#101010' : '#F3F3F3'}
                centerLabelComponent={() => {
                    return <Text color={currentTheme === 'dark' ? "$white" : "$black"} style={{fontSize: 30}}>{Math.floor(data)}%</Text>;
                    }}
            />
        </View>
    )
}

export default PieGraph;