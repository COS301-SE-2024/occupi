import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    View, Text
  } from '@gluestack-ui/themed';
  import * as SecureStore from 'expo-secure-store';
  import { LineChart } from "react-native-gifted-charts"
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';


const AnalyticsGraph = (data) => {
  const colorscheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorscheme : theme;
    // console.log(data.data);
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
          maxValue={10}
          noOfSections={data.length}
          hideRules
          animateOnDataChange
          animationDuration={1000}
          onDataChangeAnimationDuration={300}
          areaChart
          focusEnabled
          showDataPointOnFocus
          focusedDataPointColor={'white'}
          showStripOnFocus
          showTextOnFocus
          endSpacing={0}
          yAxisTextStyle={{color: labels}}
          xAxisLabelTextStyle={{color: labels, fontSize: 4}}
          data={data.data}
          // hideDataPoints
          // curved
          startFillColor={accentColour}
          endFillColor={accentColour}
          startOpacity={0.5}
          endOpacity={0.1}
          spacing={29}
          rotateLabel
          backgroundColor={currentTheme === 'dark' ? "transparent" : "white"}
          // showVerticalLines
          // verticalLinesColor="rgba(14,164,164,0.5)"
          // rulesColor="gray"
          // rulesType="dashed"
          xAxisColor="transparent"
          yAxisColor="transparent"
          initialSpacing={10}
          // yAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
          // xAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
        />
      </View>
  )
}

export default AnalyticsGraph;