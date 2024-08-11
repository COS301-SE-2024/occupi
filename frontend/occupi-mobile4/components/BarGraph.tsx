import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    View, Text
  } from '@gluestack-ui/themed';
  import * as SecureStore from 'expo-secure-store';
  import { BarChart } from "react-native-gifted-charts"
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';
import { convertValues } from '@/utils/occupancy';


const BarGraph = (data) => {
  const colorscheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorscheme : theme;
    // console.log(data.data);
    const labels = currentTheme === 'dark' ? "lightgray" : "darkgrey";
    const [accentColour, setAccentColour] = useState<string>('greenyellow');
    // console.log(convertValues(data.data));
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
          <Text color={currentTheme === "dark" ? 'white' : 'black'} fontWeight="$medium" underline mb="$4" alignSelf='center'>Predicted Occupancy by Number</Text>
        <BarChart
          isAnimated
          width={wp('80%')}
          color={accentColour}
          maxValue={1500}
          noOfSections={5}
          // hideRules
        //   animateOnDataChange={true}
          animationDuration={500}
        //   onDataChangeAnimationDuration={100}
          endSpacing={0}
          yAxisTextStyle={{color: labels}}
          xAxisLabelTextStyle={{color: labels}}
          data={convertValues(data.data)}
          showGradient
          frontColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
          gradientColor={accentColour}
        //   barBorderTopLeftRadius={5}
        //   barBorderTopRightRadius={5}
          spacing={20}
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

export default BarGraph