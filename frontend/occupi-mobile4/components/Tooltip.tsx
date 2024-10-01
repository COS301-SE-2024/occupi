import React, { useState, useRef, useEffect } from 'react';
import { Pressable, Text, View, Icon } from '@gluestack-ui/themed';
import { MotiView } from 'moti';
import { useTheme } from '@/components/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dimensions, StyleSheet, Modal, TouchableWithoutFeedback, useColorScheme } from 'react-native';

const Tooltip = ({ content, placement = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const [isDarkMode, setIsDarkMode] = useState(currentTheme === 'dark');
  const iconRef = useRef(null);

  // console.log('darkmode? ', isDarkMode);

  useEffect(() => {
    setIsDarkMode(currentTheme === 'dark');
    if (isVisible && iconRef.current) {
      iconRef.current.measure((x, y, width, height, pageX, pageY) => {
        const windowWidth = Dimensions.get('window').width;
        const tooltipWidth = wp('70%');
        let left = pageX - tooltipWidth / 2 + width / 2;
        let top = pageY;

        // Adjust horizontal position if tooltip goes off-screen
        if (left < wp('5%')) left = wp('5%');
        if (left + tooltipWidth > windowWidth - wp('5%')) left = windowWidth - tooltipWidth - wp('5%');

        // Adjust vertical position based on placement
        if (placement === 'top') {
          top -= hp('15%');
        } else if (placement === 'bottom') {
          top += height + hp('2%');
        }

        setPosition({ top, left });
      });
    }
  }, [isVisible, placement]);

  const tooltipStyle = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    width: wp('70%'),
    maxWidth: 300,
    backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
    borderRadius: 8,
    padding: wp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  };

  return (
    <View>
      <Pressable  onPress={() => setIsVisible(true)} ref={iconRef}>
        <Icon as={Ionicons} name="help-circle-outline" size={wp('4.5%')} color={isDarkMode ? 'white' : 'black'} />
      </Pressable>
      <Modal
        transparent={true}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 300 }}
                style={tooltipStyle}
              >
                <Text color={isDarkMode ? 'white' : 'black'} fontSize={wp('3.5%')}>
                  {content}
                </Text>
              </MotiView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Tooltip;