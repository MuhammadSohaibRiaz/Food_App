import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import * as Icon from "react-native-feather";

export default function ChangeLocationScreen() {
  const [newLocation, setNewLocation] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleLocationChange = () => {
    if (!newLocation) {
      setError('Please enter a valid address.');
      return;
    }

    // Assume we save the new location or update some state
    Alert.alert('Success', 'Location updated successfully');
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white pt-8 px-4">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-orange-500 p-2 rounded-full mr-4">
          <Icon.ArrowLeft strokeWidth={3} stroke="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-orange-500">Change Location</Text>
      </View>

      <View className="bg-orange-100 p-4 rounded-xl mb-6">
        <Text className="text-lg text-orange-800 mb-2">Current Delivery Location:</Text>
        <Text className="text-xl font-semibold text-orange-900">123 Main St, Springfield</Text>
      </View>

      <View className="mb-6">
        <Text className="text-lg text-gray-700 mb-2">Enter New Location:</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-lg"
          placeholder="Search for a new address"
          value={newLocation}
          onChangeText={(text) => {
            setNewLocation(text);
            setError('');
          }}
        />
        {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
      </View>

      <View className="mt-auto mb-8">
        <TouchableOpacity
          onPress={handleLocationChange}
          className="bg-orange-500 py-3 rounded-full items-center mb-4"
        >
          <Text className="text-white text-lg font-semibold">Confirm Change</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="border border-orange-500 py-3 rounded-full items-center"
        >
          <Text className="text-orange-500 text-lg font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

