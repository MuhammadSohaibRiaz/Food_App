import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { themeColors } from '../theme';
import { supabase } from '../supabase';

const ReviewModal = ({ isVisible, onClose, restaurantId }) => {
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState('');

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          { restaurant_id: restaurantId, rating, review_text: review }
        ]);

      if (error) throw error;
      
      // Update the restaurant's average rating
      await updateRestaurantRating(restaurantId);

      onClose();
    } catch (error) {
      console.error('Error submitting review:', error.message);
    }
  };

  const updateRestaurantRating = async (restaurantId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('restaurant_id', restaurantId);

    if (error) throw error;

    const avgRating = data.reduce((sum, review) => sum + review.rating, 0) / data.length;

    await supabase
      .from('restaurants')
      .update({ average_rating: avgRating })
      .eq('id', restaurantId);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Rate your experience</Text>
          <AirbnbRating
            count={5}
            reviews={["Terrible", "Bad", "OK", "Good", "Amazing"]}
            defaultRating={3}
            size={30}
            onFinishRating={setRating}
          />
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            onChangeText={setReview}
            value={review}
            placeholder="Write your review here..."
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 100,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%',
    borderColor: '#ddd',
    borderRadius: 8,
  },
  button: {
    backgroundColor: themeColors.bgColor(1),
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
});

export default ReviewModal;

