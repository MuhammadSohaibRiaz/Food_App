import { Image, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import * as Icon from 'react-native-feather';
import { themeColors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import DishRow from './dishRow';
import CartIcon from '../components/CartIcon';
import { useDispatch } from 'react-redux';
import { setRestaurant } from '../slices/restaurantSlice';
import { supabase } from '../supabase'; // Import the Supabase client

export default function RestaurantScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [restaurant, setRestaurantData] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      // Fetch restaurant by ID
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants') // Supabase table name
        .select('*')
        .eq('id', params.id) // Filter by the restaurant ID from params
        .single();

      if (restaurantError) {
        console.error('Error fetching restaurant:', restaurantError.message);
        return;
      }

      // Fetch dishes associated with the restaurant
      const { data: dishesData, error: dishesError } = await supabase
        .from('dishes') // Supabase table for dishes
        .select('*')
        .eq('restaurant_id', params.id); // Assuming 'restaurant_id' is the foreign key in 'dishes'

      if (dishesError) {
        console.error('Error fetching dishes:', dishesError.message);
        return;
      }

      setRestaurantData(restaurantData); // Update state with restaurant data
      setDishes(dishesData); // Update state with dishes data
      dispatch(setRestaurant({ ...restaurantData })); // Update Redux state
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={themeColors.bgColor(1)} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Restaurant not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView>
      <View>
      <CartIcon />
        <ScrollView>
          {/* Restaurant Image */}
          <View className="relative">
            <Image
              className="w-full h-72"
              source={{ uri: restaurant.image }} // Use dynamic image URL
            />
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              className="absolute top-8 left-4 bg-gray-50 rounded-full shadow"
            >
              <Icon.ArrowLeft height={40} width={40} strokeWidth={3} stroke={themeColors.bgColor(1)} />
            </TouchableOpacity>
          </View>

          {/* Restaurant Details */}
          <View
            style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
            className="bg-slate-50 -mt-32 pt-6"
          >
            <View className="px-5">
              <Text className="text-3xl font-bold">{restaurant.name}</Text>
              <View className="flex-row flex-wrap items-start mt-1">
                <View className="flex-row items-center mr-2">
                  <Image
                    className="h-4 w-4"
                    source={require('../assets/fullstar.png')}
                  />
                  <Text className="text-xs">
                    <Text className="text-green-700">{restaurant.stars}</Text>
                    <Text className="text-gray-700"> ({restaurant.reviews} reviews)</Text>
                  </Text>
                </View>
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-gray-700 text-xs font-semibold">{restaurant.category}</Text>
                  <Text className="text-gray-500 text-xl"> · </Text>
                  <View className="flex-row items-center">
                    <Icon.MapPin
                      stroke={themeColors.bgColor(0.8)}
                      color="gray"
                      width="15"
                      height="15"
                    />
                    <Text className="text-gray-700 text-xs ml-1">
                      Nearby · {restaurant.address}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-gray-700 -mt-1">
                {restaurant.description}
              </Text>
            </View>
          </View>

          {/* Menu Section */}
          <View className="pb-36 bg-slate-50">
            <Text className="px-4 py-3 text-2xl font-bold">Menu</Text>
            {dishes && dishes.length > 0 ? (
              dishes.map((dish, index) => (
                <DishRow item={{ ...dish }} key={index} />
              ))
            ) : (
              <Text className="text-center text-gray-500">
                No dishes available
              </Text>
            )}
           
          </View>
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

