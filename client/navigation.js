import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from './ThemeContext';
import HomeScreen from './screens/HomeScreen';
import RestaurantScreen from './screens/RestaurantScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CartScreen from './screens/CartScreen';
import OrderPreparingScreen from './screens/OrderPreparingScreen';
import DeliveryScreen from './screens/DeliveryScreen';
import SplashScreen from './screens/SplashScreen';
import LogInScreen from './screens/LogInScreen';
import SignUpScreen from './screens/SignUpScreen';
import UserProfile from './screens/UserProfile';
import ChangeLocationScreen from './screens/ChangeLocationScreen';
import CategoryRestaurantsScreen from './screens/CategoryRestaurantsScreen';
import { CardStyleInterpolators } from '@react-navigation/stack';
import SearchScreen from './screens/SearchScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import { themeColors } from './theme';
import ReviewsScreen from './screens/ReviewsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen'

const Stack = createNativeStackNavigator();

export default function Navigation({ session }) {
  const { theme } = useTheme();

  const customDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#FFFFFF',
      text: '#333333',
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#1F2937',
      text: '#FFFFFF',
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={theme === 'dark' ? customDarkTheme : customDefaultTheme}>
        <Stack.Navigator
          initialRouteName={session ? "Home" : "Splash"}
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        >
          {session ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Restaurant" component={RestaurantScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen 
                name="OrderPreparing" 
                component={OrderPreparingScreen}
                options={{
                  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                }}
              />
              <Stack.Screen 
                name="Delivery" 
                component={DeliveryScreen}
                options={{
                  cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
                }}
              />
              <Stack.Screen name="UserProfile" component={UserProfile} />
              <Stack.Screen name="ChangeLocation" component={ChangeLocationScreen} />
              <Stack.Screen name="CategoryRestaurants" component={CategoryRestaurantsScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
              <Stack.Screen name="Reviews" component={ReviewsScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="LogIn" component={LogInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

