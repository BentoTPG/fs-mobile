import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { fetchMenuIngredients } from '../api';

const Detail = ({ route }) => {
  const [item, setItem] = useState({});
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`http://10.0.2.2:5000/api/food_database/${route.params.menu_id}`)
      .then(res => res.json())
      .then((result) => {
        setItem(result);
        setIsLoading(false);
      });

    fetchMenuIngredients(route.params.menu_id)
      .then(res => {
        setIngredients(res);
      })
      .catch(error => {
        console.error('Error fetching ingredients:', error);
      });
  }, []);

  return (
    <ScrollView style={styles.container}>
      {isLoading ? 
        <Text>Loading</Text> 
        : 
        <View>
          <Image source={{ uri: item.menu_image }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.menuName}>{item.menu_name}</Text>
            <Text>{item.menu_detail}</Text>
            <Text style={styles.heading}>วัตถุดิบที่ใช้</Text>
            {ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.ingredient}>{ingredient.name}</Text>
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
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 333,
  },
  textContainer: {
    padding: 10,
  },
  menuName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 18,
    marginTop: 10,
  },
  ingredient: {
    fontSize: 16,
    marginVertical: 2,
  },
});

export default Detail;