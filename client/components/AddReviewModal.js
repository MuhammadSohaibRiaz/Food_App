import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { supabase } from '../supabase';
import { themeColors } from '../theme';

export default function AddReviewModal({ isVisible, onClose, restaurantId, onReviewAdded }) {
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState('');

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          rating: rating,
          comment: review,
        });

      if (error) throw error;

      onReviewAdded();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
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
          <Text style={styles.modalTitle}>Add Your Review</Text>
          <AirbnbRating
            count={5}
            reviews={["Terrible", "Bad", "OK", "Good", "Amazing"]}
            defaultRating={3}
            size={30}
            onFinishRating={setRating}
          />
          <TextInput
            style={styles.input}
            placeholder="Write your review here..."
            multiline
            numberOfLines={4}
            value={review}
            onChangeText={setReview}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: themeColors.bgColor(1),
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: '100%',
  },
  cancelButtonText: {
    color: themeColors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

