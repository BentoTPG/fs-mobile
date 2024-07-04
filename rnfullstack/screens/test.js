import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const ingredientsList = [
  'Chicken',
  'Beef',
  'Pork',
  'Fish',
  'Rice',
  'Carrot',
  'Potato',
  'Tomato',
  'Onion',
  'Garlic',
];

const AddIngredient = () => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients((prevSelected) => {
      if (prevSelected.includes(ingredient)) {
        return prevSelected.filter((item) => item !== ingredient);
      } else {
        return [...prevSelected, ingredient];
      }
    });
  };

  const handleConfirm = () => {
    // Handle confirm logic here
    console.log('Confirmed Ingredients:', selectedIngredients);
  };

  const handleCancel = () => {
    // Handle cancel logic here
    setSelectedIngredients([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Ingredients:</Text>
      <FlatList
        data={ingredientsList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.ingredientButton,
              selectedIngredients.includes(item) && styles.selected,
            ]}
            onPress={() => toggleIngredient(item)}
          >
            <Text style={styles.ingredientText}>{item}</Text>
          </TouchableOpacity>
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
      <View style={styles.buttonContainer}>
        <Button title="Confirm" onPress={handleConfirm} />
        <Button title="Cancel" onPress={handleCancel} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  ingredientButton: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#cce5ff',
  },
  ingredientText: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default AddIngredient;
