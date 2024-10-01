import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import {
  View
} from '@gluestack-ui/themed';
import * as SecureStore from 'expo-secure-store';
import { BarChart } from "react-native-gifted-charts";
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeContext';
import { convertValues, convertValuesHour } from '@/utils/occupancy';


const BarGraph = ({data,tab}) => {
  console.log('tab',data)
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
        style={{ width: wp('100%'), flexDirection: 'column' }}
        // style={{
        //   // marginVertical: 100,
        //   paddingVertical: 20,
        //   backgroundColor: '#414141',
        // }}
        >
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
          data={tab === 3 ? convertValues(data) : convertValuesHour(data)}
          showGradient
          hideRules
          frontColor={currentTheme === 'dark' ? "lightgray" : "darkgrey"}
          gradientColor={accentColour}
        //   barBorderTopLeftRadius={5}
        //   barBorderTopRightRadius={5}
          spacing={12}
          backgroundColor={currentTheme === 'dark' ? "transparent" : "white"}
          // showVerticalLines
          // verticalLinesColor="rgba(14,164,164,0.5)"
          // rulesColor="gray"
          // rulesType="dashed"
          xAxisColor="transparent"
          yAxisColor="transparent"
          initialSpacing={16}
        />
      </View>
  )
}

export default BarGraph