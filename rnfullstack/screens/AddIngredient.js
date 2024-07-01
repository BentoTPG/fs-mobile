import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { addIngredient } from '../api';

const AddIngredient = () => {
  const handleAddIngredient = (name) => {
    addIngredient({ name })
      .then(response => console.log('Added:', response))
      .catch(error => console.error('Error adding ingredient:', error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Ingredients to Add</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Add Rice"
          onPress={() => handleAddIngredient('Rice')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Add Chicken"
          onPress={() => handleAddIngredient('Chicken')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Add Pork"
          onPress={() => handleAddIngredient('Pork')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  buttonContainer: {
    marginVertical: 8,
  },
});

export default AddIngredient;
