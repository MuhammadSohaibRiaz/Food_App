import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import Categories from '../components/Categories';
import FeaturedRow from '../components/FeaturedRow';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { getCurrentLocation, calculateDistance } from '../utils/locationService';

const categories = ['Fast Food', 'Ice Cream', 'Bakery', 'Healthy Food', 'Snacks', 'Fish'];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [featuredData, setFeaturedData] = useState([]);
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      fetchRestaurantsByCategory(selectedCategory);
    } else {
      fetchAllRestaurants();
    }
    getUserLocation();
  }, [selectedCategory]);

  useEffect(() => {
    filterRestaurants();
  }, [selectedCategory, allRestaurants, userLocation]);

  async function getUserLocation() {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
      } else {
        console.log('Location not available');
        // You can show a message to the user here if you want
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  }

  async function fetchAllRestaurants() {
    try {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (error) throw error;
      setAllRestaurants(data);
    } catch (error) {
      console.log('Error fetching restaurants:', error);
    }
  }

  async function fetchRestaurantsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('category', category);
      if (error) throw error;
      setAllRestaurants(data);
    } catch (error) {
      console.log('Error fetching restaurants by category:', error);
    }
  }

  function filterRestaurants() {
    let filtered = allRestaurants;
    if (userLocation) {
      filtered = filtered.map(restaurant => ({
        ...restaurant,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          restaurant.latitude,
          restaurant.longitude
        )
      })).sort((a, b) => a.distance - b.distance);
    }
    const groupedData = groupRestaurantsByCategory(filtered);
    setFeaturedData(groupedData);
  }

  function groupRestaurantsByCategory(restaurants) {
    const categories = [...new Set(restaurants.map(restaurant => restaurant.category))];
    return categories.map(category => ({
      title: category,
      description: `Explore the best ${category} restaurants near you`,
      restaurants: restaurants.filter(restaurant => restaurant.category === category),
    }));
  }

  const renderHeader = () => (
    <>
      <View className="flex-row items-center space-x-2 px-4 pb-2 pt-2">
        <View className="flex-row flex-1 items-center p-3 rounded-full border border-gray-300">
          <Icon.Search height="25" width="25" stroke={themeColors.bgColor(1)} />
          <TextInput placeholder='Restaurants' className="ml-2 flex-1" />
          <View className="flex-row items-center space-x-1 border-0 border-l-2 pl-2 border-l-gray-300">
            <Icon.MapPin height="20" width="20" stroke={themeColors.bgColor(1)} />
            <Text className="text-gray-600">Punjab,PK</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center space-x-2 px-4 pb-2">
        <View style={{ backgroundColor: themeColors.bgColor(1) }} className="p-3 rounded-full">
          <Icon.Sliders height="20" width="20" strokeWidth={2.5} stroke="white" />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={{ backgroundColor: themeColors.bgColor(1) }} className="p-3 rounded-full">
          <Icon.User height="20" width="20" strokeWidth={2} stroke="white" />
        </TouchableOpacity>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={theme === 'dark' ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={theme === 'dark'}
        />
      </View>
      <Categories
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onCategoryPress={(category) => {
          setSelectedCategory(category);
          navigation.navigate('CategoryRestaurants', { category });
        }}
      />
    </>
  );

  const renderFeaturedRow = ({ item }) => (
    <FeaturedRow
      key={item.title}
      title={item.title}
      description={item.description}
      restaurants={item.restaurants}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF' }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <FlatList
        data={featuredData}
        renderItem={renderFeaturedRow}
        keyExtractor={(item) => item.title}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

