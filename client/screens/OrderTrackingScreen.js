import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import { supabase } from '../supabase';

const OrderTrackingScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(updateDriverLocation, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(*),
          driver:drivers(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      setOrder(data);
      if (data.driver) {
        setDriverLocation({
          latitude: data.driver.current_latitude,
          longitude: data.driver.current_longitude,
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error.message);
    }
  };

  const updateDriverLocation = async () => {
    if (order && order.driver_id) {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('current_latitude, current_longitude')
          .eq('id', order.driver_id)
          .single();

        if (error) throw error;

        setDriverLocation({
          latitude: data.current_latitude,
          longitude: data.current_longitude,
        });
      } catch (error) {
        console.error('Error updating driver location:', error.message);
      }
    }
  };

  if (!order || !driverLocation) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={themeColors.bgColor(1)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Order #{order.id}</Text>
        <Text className="text-lg text-gray-600">{order.status}</Text>
      </View>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={driverLocation}
          title="Driver"
          description="Your order is on the way!"
        >
          <Icon.Truck stroke={themeColors.bgColor(1)} fill={themeColors.bgColor(0.2)} width={30} height={30} />
        </Marker>
      </MapView>
      <View className="p-4 bg-white">
        <Text className="text-lg font-semibold text-gray-800">
          Estimated Delivery Time: {new Date(order.estimated_delivery_time).toLocaleTimeString()}
        </Text>
        <Text className="text-lg text-gray-600">Driver: {order.driver.name}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
});

export default OrderTrackingScreen;

