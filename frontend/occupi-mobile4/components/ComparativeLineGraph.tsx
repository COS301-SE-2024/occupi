import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    View, Text
} from '@gluestack-ui/themed';
import * as SecureStore from 'expo-secure-store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LineChart } from "react-native-gifted-charts"
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';


const ComparativelineGraph = ({ data, data2, title, x_axis }) => {
    const colorscheme = useColorScheme();
    const { theme } = useTheme();
    const currentTheme = theme === "system" ? colorscheme : theme;
    // console.log(data);
    const labels = currentTheme === 'dark' ? "lightgray" : "darkgrey";
    const [accentColour, setAccentColour] = useState<string>('greenyellow');
    useEffect(() => {
        const getAccentColour = async () => {
            let accentcolour = await SecureStore.getItemAsync('accentColour');
            setAccentColour(accentcolour);
        };
        getAccentColour();
    }, []);

    return (
        <View my="$2" w="$full" flexDirection='column' alignItems='center' justifyContent='space-around'>
            <Text underline color={currentTheme === 'dark' ? "$white" : "$black"}>{title}</Text>
            <View w="$1/2" flexDirection='row' justifyContent='space-between' my={6}>
                <View flexDirection='row' alignItems='center'>
                    <FontAwesome name="circle" size={12} color="red" /><Text color={currentTheme === 'dark' ? "white" : "black"}>  arrival</Text>
                </View>
                <View flexDirection='row' alignItems='center'>
                    <FontAwesome name="circle" size={12} color="blue" /><Text color={currentTheme === 'dark' ? "white" : "black"}>  arrival</Text>
                </View>
            </View>
            <LineChart
                isAnimated
                width={wp('85%')}
                thickness={3}
                yAxisOffset={7}
                color={'red'}
                color2={'blue'}
                maxValue={10}
                noOfSections={10}
                hideRules
                areaChart
                animateOnDataChange
                startFillColor1="red"
                startFillColor2="blue"
                animationDuration={1000}
                onDataChangeAnimationDuration={300}
                focusEnabled
                showDataPointOnFocus
                textColor1={currentTheme === 'dark' ? "white" : "black"}
                textColor2={currentTheme === 'dark' ? "white" : "black"}
                focusedDataPointColor={'white'}
                showStripOnFocus
                showTextOnFocus
                endSpacing={20}
                yAxisTextStyle={{ color: labels }}
                xAxisLabelTextStyle={{ color: labels, fontSize: 8.5 }}
                data={data}
                data2={data2}
                // hideDataPoints
                curved
                startFillColor={accentColour}
                endFillColor={accentColour}
                startOpacity={0.5}
                endOpacity={0.1}
                spacing={data.length > 30 ? 30 : data.length * 7}
                // rotateLabel
                backgroundColor={currentTheme === 'dark' ? "transparent" : "white"}
                // showVerticalLines
                // verticalLinesColor="rgba(14,164,164,0.5)"
                // rulesColor="gray"
                // rulesType="dashed"
                xAxisColor="transparent"
                yAxisColor="transparent"
                initialSpacing={15}
            // yAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
            // xAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
            />
            <Text color={currentTheme === 'dark' ? "$white" : "$black"}>{x_axis}</Text>
        </View>
    )
}

export default ComparativelineGraph;