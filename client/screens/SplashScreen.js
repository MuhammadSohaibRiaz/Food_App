import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Gif from 'react-native-gif';
import { themeColors } from '../theme';
import * as Icon from "react-native-feather";

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const [currentSplash, setCurrentSplash] = useState(0);
  const navigation = useNavigation();
  const pan = useRef(new Animated.ValueXY()).current;

  const splashContent = [
    {
      image: require('../assets/images/pizza_circulating.gif'),
      text: 'Savor the Flavor!',
    },
    {
      image: require('../assets/images/pizza_circulating.gif'),
      text: "Craving? We've Got You!",
    },
    {
      image: require('../assets/images/biker.gif'),
      text: 'Speedy Service, Delicious Food!',
    },
  ];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50 && currentSplash > 0) {
        handlePrevious();
      } else if (gestureState.dx < -50 && currentSplash < splashContent.length - 1) {
        handleNext();
      }
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  });

  const renderText = () => {
    return (
      <Animatable.Text
        animation="fadeIn"
        duration={1000}
        style={styles.text}
      >
        {splashContent[currentSplash].text}
      </Animatable.Text>
    );
  };

  const handleNext = () => {
    if (currentSplash < splashContent.length - 1) {
      setCurrentSplash(currentSplash + 1);
    } else {
      navigation.replace('LogIn');
    }
  };

  const handlePrevious = () => {
    if (currentSplash > 0) {
      setCurrentSplash(currentSplash - 1);
    }
  };

  const handleSkip = () => {
    navigation.replace('LogIn');
  };

  const renderBullets = () => {
    return (
      <View style={styles.bulletContainer}>
        {splashContent.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentSplash(index)}
            style={[
              styles.bullet,
              currentSplash === index && styles.activeBullet
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Animated.View 
      style={[styles.container, { transform: [{ translateX: pan.x }] }]}
      {...panResponder.panHandlers}
    >
      <Animatable.View
        animation="fadeIn"
        duration={1500}
        style={styles.imageContainer}
      >
        <Gif
          source={splashContent[currentSplash].image}
          style={styles.image}
          resizeMode='contain'
        />
      </Animatable.View>
      {renderText()}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handlePrevious} style={styles.arrowButton}>
          <Icon.ChevronLeft stroke={themeColors.bgColor(1)} width={30} height={30} />
        </TouchableOpacity>
        {renderBullets()}
        <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
          <Icon.ChevronRight stroke={themeColors.bgColor(1)} width={30} height={30} />
        </TouchableOpacity>
      </View>
      {currentSplash === splashContent.length - 1 && (
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.replace('LogIn')}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  imageContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  image: {
    width: Math.min(width, height) * 0.5,
    height: Math.min(width, height) * 0.5,
  },
  text: {
    fontSize: 24,
    color: themeColors.bgColor(1),
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    position: 'absolute',
    top: height * 0.6,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    width: '100%',
  },
  bulletContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    margin: 5,
  },
  activeBullet: {
    backgroundColor: themeColors.bgColor(1),
    width: 12,
    height: 12,
  },
  arrowButton: {
    padding: 10,
  },
  getStartedButton: {
    backgroundColor: themeColors.bgColor(1),
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    position: 'absolute',
    bottom: 100,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  skipButtonText: {
    color: themeColors.bgColor(1),
    fontSize: 16,
    fontWeight: 'bold',
  },
});

