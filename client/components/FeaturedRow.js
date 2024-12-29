import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { themeColors } from '../theme';
import RestaurantCard from './RestaurantCard';
import { useNavigation } from '@react-navigation/native';

export default function FeaturedRow({title, description, restaurants}) {
  const navigation = useNavigation();

  const handleSeeAll = () => {
    navigation.navigate('CategoryRestaurants', { category: title });
  };

  const renderRestaurantCard = ({ item, index }) => (
    <RestaurantCard key={index} item={item} />
  );

  return (
    <View>
      <View className="flex-row justify-between items-center px-4 pt-2">
        <View className="flex-1 pr-2">
          <Text className="font-bold text-lg">{title}</Text>
          <Text className="text-gray-500 text-xs">{description}</Text>
        </View>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={{color: themeColors.text}} className="font-semibold">See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={restaurants}
        renderItem={renderRestaurantCard}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingVertical: 15
        }}
      />
    </View>
  );
}

