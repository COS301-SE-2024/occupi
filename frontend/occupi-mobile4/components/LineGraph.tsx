import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    View,
  } from '@gluestack-ui/themed';
  import * as SecureStore from 'expo-secure-store';
  import { LineChart } from "react-native-gifted-charts"

const LineGraph = (data) => {
    console.log(data.data);
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
        <LineChart
          isAnimated
          width={wp('80%')}
          thickness={3}
          color={accentColour}
          maxValue={4}
          noOfSections={4}
          // hideRules
          animateOnDataChange
          animationDuration={1000}
          onDataChangeAnimationDuration={300}
          areaChart
          endSpacing={0}
          yAxisTextStyle={{color: 'lightgray'}}
          xAxisLabelTextStyle={{color:'white'}}
          data={data.data}
          hideDataPoints
          startFillColor={accentColour}
          endFillColor={accentColour}
          startOpacity={0.5}
          endOpacity={0.1}
          spacing={47}
          backgroundColor="#414141"
          // showVerticalLines
          // verticalLinesColor="rgba(14,164,164,0.5)"
          // rulesColor="gray"
          rulesType="dashed"
          initialSpacing={20}
          yAxisColor="lightgray"
          xAxisColor="lightgray"
        />
      </View>
  )
}

export default LineGraph