import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Button, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { UserContext } from '../App'; // Import UserContext

export default function AddIngredient() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext); // Use UserContext
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIngredients();
    fetchCategories();
    fetchExistingIngredients();
  }, []);

  const fetchIngredients = () => {
    fetch('https://fridgetofeast-a95f6e626f53.herokuapp.com/api/ingredients', {
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then((result) => {
        console.log('Ingredients fetched:', result);
        setItems(result);
        setFilteredItems(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching ingredients:', error);
        setIsLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch('https://fridgetofeast-a95f6e626f53.herokuapp.com/api/categories', {
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then((result) => {
        console.log('Categories fetched:', result);
        setCategories(result);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  };

  const fetchExistingIngredients = () => {
    fetch('https://fridgetofeast-a95f6e626f53.herokuapp.com/api/user_ingredients', {
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then((result) => {
        console.log('User ingredients fetched:', result);
        setExistingIngredients(result.map(item => item.Ingredient_name));
      })
      .catch(error => {
        console.error('Error fetching user ingredients:', error);
      });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === '') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.Ingredient_category === category));
    }
  };

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients((prevSelected) => {
      if (prevSelected.includes(ingredient.Ingredient_name)) {
        return prevSelected.filter((item) => item !== ingredient.Ingredient_name);
      } else {
        return [...prevSelected, ingredient.Ingredient_name];
      }
    });
  };

  const handleConfirm = () => {
    const newIngredients = selectedIngredients.filter(name => !existingIngredients.includes(name));
    if (newIngredients.length === 0) {
      alert('All selected ingredients already exist in the list');
      return;
    }
  
    console.log('Sending new ingredient names:', newIngredients);
    console.log('Sending user ID:', user.user_id);
  
    fetch('https://fridgetofeast-a95f6e626f53.herokuapp.com/api/add_ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        ingredient_names: newIngredients,
        user_id: user.user_id,
      }),
    })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        setSelectedIngredients([]);
        fetchExistingIngredients();
        navigation.navigate('Home'); // Navigate to Home screen after confirmation
      } else {
        console.error('Error adding ingredients:', response.error);
        alert(`Error adding ingredients: ${response.error}`);
      }
    })
    .catch(error => {
      console.error('Error sending data:', error);
      alert(`Error sending data: ${error.message}`);
    });
  };

  const handleCancel = () => {
    setSelectedIngredients([]);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const normalizedText = text.toLowerCase();
    setFilteredItems(items.filter(item => item.Ingredient_name.toLowerCase().includes(normalizedText)));
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLargeTitle: true,
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchTerm}
            onChangeText={(text) => handleSearch(text)}
          />
        </View>
      ),
    });
  }, [navigation, items, searchTerm]);

  const renderItem = ({ item }) => {
    const isSelected = selectedIngredients.includes(item.Ingredient_name);
    return (
      <Pressable 
        onPress={() => toggleIngredient(item)} 
        style={[styles.featureContainer, isSelected && styles.selectedContainer]}
      >
        {item.Ingredient_image && <Image source={{ uri: item.Ingredient_image }} style={styles.image} />}
        <View style={styles.textContainer}>
          <Text style={styles.menuName}>{item.Ingredient_name}</Text>
        </View>
      </Pressable>
    );
  };

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      {item.map((ingredient, index) => (
        <View key={index} style={styles.column}>
          {renderItem({ item: ingredient })}
        </View>
      ))}
      {item.length === 1 && <View style={[styles.column, styles.emptyColumn]} />}
    </View>
  );

  const chunkArray = (array, size) => {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
  };

  const chunkedData = chunkArray(filteredItems, 2);

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => handleCategoryChange(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="All" value="" />
        {categories && categories.length > 0 ? categories.map((category, index) => (
          <Picker.Item key={index} label={category || "Unnamed Category"} value={category} />
        )) : null}
      </Picker>
      <FlatList
        data={chunkedData}
        renderItem={renderRow}
        keyExtractor={(item, index) => index.toString()}
        refreshing={isLoading}
        onRefresh={fetchIngredients}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.buttonContainer}>
        <Button title="Confirm" onPress={handleConfirm} />
        <Button title="Cancel" onPress={handleCancel} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    flex: 1,
    paddingHorizontal: 5,
  },
  featureContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#007BFF',
  },
  emptyColumn: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    padding: 10,
  },
  menuName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 8,
    fontSize: 16,
  },
});
