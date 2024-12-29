import { Image, View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { themeColors } from '../theme';
import * as Icon from 'react-native-feather';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, selectCartItemsById } from '../slices/cartSlice';

export default function DishRow({ item }) {
  const dispatch = useDispatch();
  const totalItems = useSelector((state) => selectCartItemsById(state, item.id));

  const handleIncrease = () => {
    dispatch(addToCart({ ...item }));
  };

  const handleDecrease = () => {
    dispatch(removeFromCart({ id: item.id }));
  };

  return (
    <View className="flex-row items-center bg-white rounded-3xl shadow-2xl mb-3 mx-2">
      {/* Dish Image */}
      <Image
        className="rounded-3xl"
        style={{ width: 100, height: 100 }}
        source={{ uri: item.image }} // Dynamic image URL
        onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
      />

      {/* Dish Details */}
      <View className="flex flex-1 space-y-3">
        <View className="pl-3">
          <Text className="text-xl font-semibold text-gray-800">{item.name}</Text>
          <Text className="text-gray-500 text-sm">{item.description}</Text>
        </View>

        {/* Price and Cart Actions */}
        <View className="flex-row justify-between pl-3 items-center">
          <Text className="text-gray-700 text-lg font-bold">${item.price}</Text>
          <View className="flex-row items-center space-x-2">
            {/* Decrease Button */}
            <TouchableOpacity
              onPress={handleDecrease}
              disabled={!totalItems.length}
              className="p-1 rounded-full"
              style={{
                backgroundColor: totalItems.length
                  ? themeColors.bgColor(1)
                  : 'gray',
              }}
            >
              <Icon.Minus
                strokeWidth={3}
                height={20}
                width={20}
                stroke={'white'}
              />
            </TouchableOpacity>

            {/* Quantity */}
            <Text className="px-3 text-gray-700 font-semibold">
              {totalItems.length}
            </Text>

            {/* Increase Button */}
            <TouchableOpacity
              onPress={handleIncrease}
              className="p-1 rounded-full"
              style={{ backgroundColor: themeColors.bgColor(1) }}
            >
              <Icon.Plus
                strokeWidth={3}
                height={20}
                width={20}
                stroke={'white'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
