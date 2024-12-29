import React, { useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { themeColors } from '../theme';
import * as Icon from "react-native-feather"
import { useDispatch, useSelector } from 'react-redux';
import { selectRestaurant } from '../slices/restaurantSlice';
import { useNavigation } from '@react-navigation/native';
import { removeFromCart, selectCartItems, selectCartTotal, emptyCart } from '../slices/cartSlice';
import { supabase } from '../supabase';
import { scheduleOrderNotification } from '../notificationService';

export default function CartScreen() {
    const restaurant = useSelector(selectRestaurant);
    const navigation = useNavigation();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const [groupedItems, setGroupedItems] = useState([]);
    const deliveryFee = 2;
    const dispatch = useDispatch();

    useEffect(() => {
        const items = cartItems.reduce((group, item) => {
            if (group[item.id]) {
                group[item.id].push(item);
            } else {
                group[item.id] = [item];
            }
            return group;
        }, {});
        setGroupedItems(Object.entries(items).map(([key, items]) => ({ id: key, items })));
    }, [cartItems]);

    const handlePlaceOrder = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
        
            if (userError || !user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    restaurant_id: restaurant.id,
                    status: 'Placed',
                    estimated_delivery_time: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
                })
                .select()
                .single();

            if (error) throw error;

            await scheduleOrderNotification(data.id, restaurant.name, data.estimated_delivery_time);

            dispatch(emptyCart());

            Alert.alert(
                "Order Placed!",
                `Your order #${data.id} has been placed successfully. Estimated delivery time: 30 minutes.`,
                [
                    { text: "OK", onPress: () => navigation.navigate('OrderTracking', { orderId: data.id }) }
                ]
            );
        } catch (error) {
            console.error('Error placing order:', error);
            if (error.message === 'User not authenticated') {
                Alert.alert(
                    "Authentication Required",
                    "Please log in to place an order.",
                    [
                        { text: "OK", onPress: () => navigation.navigate('LogIn') }
                    ]
                );
            } else {
                Alert.alert("Error", "Failed to place order. Please try again.");
            }
        }
    };

    const renderCartItem = ({ item }) => {
        const dish = item.items[0];
        return (
            <View style={styles.cartItem}>
                <Text style={styles.itemCount}>{item.items.length} x</Text>
                <Image source={{ uri: dish.image }} style={styles.itemImage} />
                <Text style={styles.itemName}>{dish.name}</Text>
                <Text style={styles.itemPrice}>${dish.price}</Text>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => dispatch(removeFromCart({ id: dish.id }))}
                >
                    <Icon.Minus strokeWidth={2} height={20} width={20} stroke={'white'} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.goBackButton}
                >
                    <Icon.ArrowLeft strokeWidth={3} stroke="white" />
                </TouchableOpacity>
                <Text style={styles.cartTitle}>Your Cart</Text>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
            </View>

            <View style={styles.deliveryInfo}>
                <Image source={require('../assets/images/deliveryguy2.png')} style={styles.deliveryImage} />
                <Text style={styles.deliveryText}>Deliver in 20-30 minutes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ChangeLocation')}>
                    <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() => navigation.navigate('OrderTracking', { orderId: 1 })}
                style={{
                    backgroundColor: themeColors.bgColor(1),
                    padding: 10,
                    borderRadius: 20,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginHorizontal: 20,
                    marginVertical: 10,
                }}
            >
                <Icon.Truck stroke="white" width={20} height={20} />
                <Text style={{ marginLeft: 10, color: 'white', fontWeight: 'bold' }}>Track Order</Text>
            </TouchableOpacity>

            <FlatList
                data={groupedItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.cartItemsContainer}
            />

            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalText}>Subtotal</Text>
                    <Text style={styles.totalText}>${cartTotal}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalText}>Delivery Fee</Text>
                    <Text style={styles.totalText}>${deliveryFee}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.orderTotalText}>Order Total</Text>
                    <Text style={styles.orderTotalText}>${deliveryFee + cartTotal}</Text>
                </View>
                <TouchableOpacity
                    onPress={handlePlaceOrder}
                    style={styles.placeOrderButton}
                >
                    <Text style={styles.placeOrderText}>Place Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        height: 100,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    goBackButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: themeColors.bgColor(1),
        borderRadius: 30,
        padding: 8,
    },
    cartTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    restaurantName: {
        fontSize: 16,
        color: 'gray',
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: themeColors.bgColor(0.2),
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 10,
    },
    deliveryImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    deliveryText: {
        flex: 1,
        marginLeft: 10,
    },
    changeText: {
        color: themeColors.bgColor(1),
        fontWeight: 'bold',
    },
    cartItemsContainer: {
        paddingHorizontal: 15,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemCount: {
        fontWeight: 'bold',
        marginRight: 10,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    itemName: {
        flex: 1,
        marginLeft: 10,
    },
    itemPrice: {
        fontWeight: 'bold',
    },
    removeButton: {
        backgroundColor: themeColors.bgColor(1),
        borderRadius: 20,
        padding: 5,
        marginLeft: 10,
    },
    totalSection: {
        padding: 15,
        backgroundColor: themeColors.bgColor(0.2),
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    totalText: {
        color: 'gray',
    },
    orderTotalText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    placeOrderButton: {
        backgroundColor: themeColors.bgColor(1),
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
    },
    placeOrderText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

