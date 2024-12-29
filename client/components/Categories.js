import React, { useState, useEffect } from 'react';
import { Image, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { useTheme } from '../ThemeContext';

export default function Categories() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryPress = (category) => {
        setActiveCategory(category.id);
        navigation.navigate('CategoryRestaurants', {
            category: category.name,
            categoryId: category.id,
            categoryImage: category.image_url
        });
    };

    if (isLoading) {
        return (
            <View className="mt-4 px-4">
                <Text className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Loading categories...
                </Text>
            </View>
        );
    }

    return (
        <View className="mt-4">
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15 }}
            >
                {categories.map((category) => {
                    const isActive = category.id === activeCategory;

                    return (
                        <View key={category.id} className="flex justify-center items-center mr-6">
                            <TouchableOpacity
                                onPress={() => handleCategoryPress(category)}
                                style={[
                                    styles.categoryButton,
                                    isActive ? styles.activeCategory : {},
                                    theme === 'dark' ? styles.darkModeButton : {}
                                ]}
                            >
                                <Image 
                                    style={[styles.categoryImage, isActive && styles.activeImage]} 
                                    source={{ uri: category.image_url }}
                                />
                            </TouchableOpacity>
                            <Text 
                                className={`text-sm ${
                                    isActive 
                                        ? theme === 'dark' 
                                            ? 'font-semibold text-white' 
                                            : 'font-semibold text-gray-800'
                                        : theme === 'dark'
                                            ? 'text-gray-400'
                                            : 'text-gray-500'
                                }`}
                            >
                                {category.name}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    categoryButton: {
        padding: 4,
        borderRadius: 9999,
        backgroundColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    darkModeButton: {
        backgroundColor: '#374151',
        shadowColor: '#000',
        shadowOpacity: 0.5,
    },
    activeCategory: {
        backgroundColor: '#4b5563',
    },
    categoryImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
    },
    activeImage: {
        borderColor: '#fff',
        borderWidth: 2,
    }
});

