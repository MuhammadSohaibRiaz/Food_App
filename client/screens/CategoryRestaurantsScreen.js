import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { themeColors } from '../theme';
import RestaurantCard from '../components/RestaurantCard';
import * as Icon from "react-native-feather";
import { supabase } from '../supabase';

export default function CategoryRestaurantsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { theme } = useTheme();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'name'
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); // Added state for categories
  const [selectedCategory, setSelectedCategory] = useState(''); // Added state for selected category


  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          dishes (
            id,
            name,
            price
          )
        `)
        .eq('category', selectedCategory || params.category);

      if (error) throw error;
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [params.category, selectedCategory]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    // Fetch categories from Supabase
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        if (error) throw error;
        setCategories(data);
        setSelectedCategory(params.category); // Set initial selected category
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };
    fetchCategories();
  }, [params.category]);


  const filterAndSortRestaurants = useCallback(() => {
    let filtered = restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchQuery, sortBy]);

  useEffect(() => {
    filterAndSortRestaurants();
  }, [filterAndSortRestaurants]);

  const handleRetry = () => {
    fetchRestaurants();
  };

  const renderCategoryPills = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingRight: 24 // Extra padding on right to prevent cutoff
      }}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.name)}
          className={`mr-3 px-6 py-2.5 rounded-full border ${
            selectedCategory === category.name
              ? theme === 'dark'
                ? 'bg-primary border-primary'
                : 'bg-primary border-primary'
              : theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-100 border-gray-200'
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.15,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text className={`${
            selectedCategory === category.name
              ? 'text-white font-semibold'
              : theme === 'dark'
                ? 'text-gray-300'
                : 'text-gray-700'
          }`}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderHeader = () => (
    <View className="mb-4">
      {renderCategoryPills()}

      <View className="px-4 pt-3">
        <View className={`flex-row items-center ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        } rounded-2xl px-4 py-3 shadow-sm`}>
          <Icon.Search
            height="20"
            width="20"
            stroke={theme === 'dark' ? '#9CA3AF' : 'gray'}
          />
          <TextInput
            placeholder="Search restaurants..."
            className={`flex-1 ml-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : 'gray'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="p-1"
            >
              <Icon.X
                height="16"
                width="16"
                stroke={theme === 'dark' ? '#9CA3AF' : 'gray'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderRestaurantCard = ({ item }) => (
    <TouchableOpacity 
      className={`mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md`}
      onPress={() => navigation.navigate("Restaurant", { ...item })}
    >
      <View className="flex-row">
        <Image
          source={{ uri: item.image }}
          className="w-32 h-32 rounded-tl-2xl rounded-bl-2xl"
        />
        <View className="flex-1 p-3">
          <Text className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {item.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Icon.Star fill={themeColors.bgColor(1)} stroke={themeColors.bgColor(1)} width={16} height={16} />
            <Text className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ml-1`}>
              {item.rating} ({item.reviews} reviews)
            </Text>
          </View>
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`} numberOfLines={2}>
            {item.description}
          </Text>
          <View className="flex-row items-center mt-2">
            <Icon.MapPin color={theme === 'dark' ? '#9CA3AF' : 'gray'} width={15} height={15} />
            <Text className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} ml-1`}>
              {item.address}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <SafeAreaView className={`flex-1 justify-center items-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <Icon.AlertCircle stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth={2} width={50} height={50} />
        <Text className={`text-center mt-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
          Error loading restaurants
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          className="mt-4 px-6 py-3 bg-primary rounded-full"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className={`p-2 rounded-full ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <Icon.ArrowLeft
            stroke={theme === 'dark' ? 'white' : themeColors.bgColor(1)}
            strokeWidth={3}
          />
        </TouchableOpacity>
        <Text className={`text-xl font-bold flex-1 ml-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Categories
        </Text>
        <TouchableOpacity
          onPress={() => setSortBy(sortBy === 'rating' ? 'name' : 'rating')}
          className={`p-2 rounded-full ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <Icon.Filter
            stroke={theme === 'dark' ? 'white' : themeColors.bgColor(1)}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={themeColors.bgColor(1)} />
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurantCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            padding: 16
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Icon.Frown
                stroke={theme === 'dark' ? 'white' : 'black'}
                strokeWidth={2}
                width={50}
                height={50}
              />
              <Text className={`text-center mt-4 text-lg ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                No restaurants found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

