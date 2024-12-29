import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';
import { themeColors } from '../theme';
import AddReviewModal from '../components/AddReviewModal';

export default function ReviewsScreen({ route }) {
  const { restaurantId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [isAddReviewVisible, setIsAddReviewVisible] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users:profiles(full_name)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewerName}>{item.users.full_name}</Text>
      <Text style={styles.rating}>Rating: {item.rating}/5</Text>
      <Text style={styles.reviewText}>{item.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reviews</Text>
      <TouchableOpacity
        style={styles.addReviewButton}
        onPress={() => setIsAddReviewVisible(true)}
      >
        <Text style={styles.addReviewButtonText}>Add Review</Text>
      </TouchableOpacity>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No reviews yet</Text>
        }
      />
      <AddReviewModal
        isVisible={isAddReviewVisible}
        onClose={() => setIsAddReviewVisible(false)}
        restaurantId={restaurantId}
        onReviewAdded={fetchReviews}
      />
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
  addReviewButton: {
    backgroundColor: themeColors.bgColor(1),
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addReviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  rating: {
    fontSize: 14,
    color: themeColors.bgColor(1),
    marginTop: 5,
  },
  reviewText: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
});

