import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    View, Text
  } from '@gluestack-ui/themed';
  import * as SecureStore from 'expo-secure-store';
  import { LineChart } from "react-native-gifted-charts"
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';


const AnalyticsGraph = ({data,title,x_axis}) => {
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

  return (
    <View  my="$2" w="$full" flexDirection='column' alignItems='center' justifyContent='space-around'>
        <Text underline color={currentTheme === 'dark' ? "$white" : "$black"}>{title}</Text>
        <LineChart
          isAnimated
          width={wp('85%')}
          thickness={3}
          color={accentColour}
          maxValue={10}
          noOfSections={10}
          hideRules
          animateOnDataChange
          animationDuration={1000}
          onDataChangeAnimationDuration={300}
          areaChart
          focusEnabled
          showDataPointOnFocus
          textColor1={currentTheme === 'dark' ? "white" : "black"}
          focusedDataPointColor={'white'}
          showStripOnFocus
          showTextOnFocus
          endSpacing={20}
          yAxisTextStyle={{color: labels}}
          xAxisLabelTextStyle={{color: labels, fontSize: 8.5}}
          data={data}
          // hideDataPoints
          curved
          startFillColor={accentColour}
          endFillColor={accentColour}
          startOpacity={0.5}
          endOpacity={0.1}
          spacing={data.length > 30 ? 30 : data.length*2}
          // rotateLabel
          backgroundColor="transparent"
          // showVerticalLines
          // verticalLinesColor="rgba(14,164,164,0.5)"
          // rulesColor="gray"
          // rulesType="dashed"
          xAxisColor="transparent"
          yAxisColor="transparent"
          initialSpacing={2}
          // yAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
          // xAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
        />
        <Text color={currentTheme === 'dark' ? "$white" : "$black"}>{x_axis}</Text>
      </View>
  )
}

export default AnalyticsGraph;