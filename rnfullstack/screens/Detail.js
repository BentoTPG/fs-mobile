import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { fetchMenuById, fetchMenuIngredients } from '../api';

const Detail = ({ route }) => {
  const [item, setItem] = useState({});
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const menu_id = route.params.menu_id;

    Promise.all([
      fetchMenuById(menu_id),
      fetchMenuIngredients(menu_id)
    ])
    .then(([menuData, ingredientsData]) => {
      setItem(menuData);
      setIngredients(ingredientsData);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    });
  }, [route.params.menu_id]);

  return (
    <ScrollView style={styles.container}>
      {isLoading ? 
        <Text style={styles.loadingText}>Loading...</Text> 
        : 
        <View style={styles.content}>
          <Image source={{ uri: item.menu_image }} style={styles.image} />
          <Text style={styles.menuName}>{item.menu_name}</Text>
          <Text style={styles.header}>Menu Detail</Text>
          <View style={styles.detailContainer}>
            <Text style={styles.menuDetail}>{item.menu_detail}</Text>
          </View>
          <Text style={styles.header}>Ingredients</Text>
          <View style={styles.ingredientContainer}>
            {ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.ingredient}>{ingredient.ingredient}</Text>
            ))}
          </View>
        </View>
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  content: {
    padding: 15,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  menuName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
    textAlign: 'left',
  },
  detailContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  menuDetail: {
    fontSize: 16,
    color: '#666',
  },
  ingredientContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  ingredient: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
});

export default Detail;
