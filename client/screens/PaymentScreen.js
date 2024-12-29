import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';
import { themeColors } from '../theme';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function PaymentScreen({ route, navigation }) {
  const { amount, orderId } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('https://your-backend-url.com/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: 'usd',
        }),
      });

      const { clientSecret } = await response.json();

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
      });

      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      console.error('Error initializing payment sheet:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        await updateOrderStatus();
        Alert.alert('Success', 'Payment successful!', [
          { text: 'OK', onPress: () => navigation.navigate('OrderTracking', { orderId }) }
        ]);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Paid', payment_status: 'Completed' })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.amount}>Amount: ${amount.toFixed(2)}</Text>
      <CardField
        postalCodeEnabled={false}
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={styles.card}
        style={styles.cardContainer}
      />
      <TouchableOpacity
        style={[styles.payButton, loading && styles.disabledButton]}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: themeColors.text,
  },
  amount: {
    fontSize: 18,
    marginBottom: 20,
    color: themeColors.text,
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
  card: {
    backgroundColor: '#efefefef',
  },
  payButton: {
    backgroundColor: themeColors.bgColor(1),
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

