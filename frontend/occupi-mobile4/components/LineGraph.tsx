import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import {
  View
} from '@gluestack-ui/themed';
import * as SecureStore from 'expo-secure-store';
import { LineChart } from "react-native-gifted-charts";
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';


const LineGraph = (data) => {
  const colorscheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorscheme : theme;
  // console.log(data.data);
  const labels = currentTheme === 'dark' ? "lightgray" : "grey";
  const [accentColour, setAccentColour] = useState<string>('greenyellow');
  useEffect(() => {
    const getAccentColour = async () => {
      let accentcolour = await SecureStore.getItemAsync('accentColour');
      setAccentColour(accentcolour);
    };
    getAccentColour();
  }, []);
  return (
    <View
      style={{ width: wp('100%'), flexDirection: 'column' }}
    // style={{
    //   // marginVertical: 100,
    //   paddingVertical: 20,
    //   backgroundColor: '#414141',
    // }}
    >
      <LineChart
        isAnimated
        width={wp('80%')}
        thickness={3}
        color={accentColour}
        maxValue={5}
        noOfSections={5}
        hideRules
        animateOnDataChange
        animationDuration={1000}
        onDataChangeAnimationDuration={300}
        areaChart
        endSpacing={0}
        yAxisTextStyle={{ color: labels }}
        xAxisLabelTextStyle={{ color: labels }}
        data={data.data}
        hideDataPoints
        startFillColor={accentColour}
        endFillColor={accentColour}
        startOpacity={0.5}
        endOpacity={0.1}
        spacing={47}
        backgroundColor={"transparent"}
        // showVerticalLines
        // verticalLinesColor="rgba(14,164,164,0.5)"
        // rulesColor="gray"
        // rulesType="dashed"
        xAxisColor="transparent"
        yAxisColor="transparent"
        initialSpacing={16}
      // yAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
      // xAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
      />
    </View>
  )
}

export default LineGraph