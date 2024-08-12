import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    View, Text
  } from '@gluestack-ui/themed';
  import * as SecureStore from 'expo-secure-store';
  import { LineChart } from "react-native-gifted-charts"
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';


const LineGraph = (data) => {
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
        style={{ width: wp('100%'), height: hp('35%'), flexDirection: 'column' }}
        // style={{
        //   // marginVertical: 100,
        //   paddingVertical: 20,
        //   backgroundColor: '#414141',
        // }}
        >
          <Text color={currentTheme === "dark" ? 'white' : 'black'} fontWeight="$medium" underline mb="$4" alignSelf='center'>Predicted Occupancy by level</Text>
        <LineChart
          isAnimated
          width={wp('80%')}
          thickness={3}
          color={accentColour}
          maxValue={5}
          noOfSections={5}
          // hideRules
          animateOnDataChange
          animationDuration={1000}
          onDataChangeAnimationDuration={300}
          areaChart
          endSpacing={0}
          yAxisTextStyle={{color: labels}}
          xAxisLabelTextStyle={{color: labels}}
          data={data.data}
          hideDataPoints
          startFillColor={accentColour}
          endFillColor={accentColour}
          startOpacity={0.5}
          endOpacity={0.1}
          spacing={47}
          backgroundColor={currentTheme === 'dark' ? "#414141" : "white"}
          // showVerticalLines
          // verticalLinesColor="rgba(14,164,164,0.5)"
          // rulesColor="gray"
          rulesType="dashed"
          initialSpacing={16}
          yAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
          xAxisColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
        />
      </View>
  )
}

export default LineGraph