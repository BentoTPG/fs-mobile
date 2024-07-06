import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function UserIngredients() {
  const navigation = useNavigation();
  const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);

  useEffect(() => {
    fetchUserIngredients();
  }, []);

  const fetchUserIngredients = () => {
    fetch('http://10.0.2.2:5000/api/user_ingredients')
      .then(res => res.json())
      .then((result) => {
        setUserIngredients(result);
        setFilteredIngredients(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user ingredients:', error);
        setIsLoading(false);
      });
  };

  const clearUserIngredients = () => {
    fetch('http://10.0.2.2:5000/api/clear_user_ingredients', {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setUserIngredients([]);
          setFilteredIngredients([]);
          Alert.alert('Success', 'User ingredients cleared successfully');
        } else {
          Alert.alert('Error', 'Failed to clear user ingredients');
        }
      })
      .catch(error => {
        console.error('Error clearing user ingredients:', error);
        Alert.alert('Error', 'Failed to clear user ingredients');
      });
  };

  const deleteUserIngredient = (ingredientName) => {
    fetch('http://10.0.2.2:5000/api/user_ingredient', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredient_name: ingredientName }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setUserIngredients(prevIngredients => prevIngredients.filter(ingredient => ingredient.ingredient_name !== ingredientName));
          setFilteredIngredients(prevIngredients => prevIngredients.filter(ingredient => ingredient.ingredient_name !== ingredientName));
          Alert.alert('Success', 'User ingredient deleted successfully');
        } else {
          Alert.alert('Error', 'Failed to delete user ingredient');
        }
      })
      .catch(error => {
        console.error('Error deleting user ingredient:', error);
        Alert.alert('Error', 'Failed to delete user ingredient');
      });
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const normalizedSearchTerm = text.toUpperCase().normalize();
    setFilteredIngredients(
      userIngredients.filter((ingredient) =>
        ingredient.ingredient_name.toUpperCase().normalize().includes(normalizedSearchTerm)
      )
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.ingredient_name}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteUserIngredient(item.ingredient_name)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Ingredients"
        value={searchTerm}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredIngredients}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshing={isLoading}
        onRefresh={fetchUserIngredients}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
      <Button title="Clear All Ingredients" onPress={clearUserIngredients} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
