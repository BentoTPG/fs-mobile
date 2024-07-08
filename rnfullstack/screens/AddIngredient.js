import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Button, Image, TouchableOpacity } from 'react-native';
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

  useEffect(() => {
    fetchIngredients();
    fetchCategories();
    fetchExistingIngredients();
  }, []);

  const fetchIngredients = () => {
    fetch('http://10.0.2.2:5000/api/ingredients', {
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then((result) => {
        setItems(result);
        setFilteredItems(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch('http://10.0.2.2:5000/api/categories', {
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then((result) => {
        setCategories(result);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  };

  const fetchExistingIngredients = () => {
    fetch('http://10.0.2.2:5000/api/user_ingredients', {
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then((result) => {
        setExistingIngredients(result.map(item => item.ingredient_name));
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

    console.log('Sending ingredient_names:', newIngredients);
    console.log('Sending user_id:', user.user_id);

    fetch('http://10.0.2.2:5000/api/add_ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        ingredient_names: newIngredients,
        user_id: user.user_id, // ตรวจสอบให้แน่ใจว่า user_id ถูกส่งอย่างถูกต้อง
      }),
    })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => { throw new Error(text) });
      }
      return res.json();
    })
    .then(response => {
      if (response.success) {
        setSelectedIngredients([]);
        fetchExistingIngredients();
      } else {
        console.error('Error adding ingredients:', response.error);
      }
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
  };

  const handleCancel = () => {
    setSelectedIngredients([]);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLargeTitle: true,
      headerSearchBarOptions: {
        placeHolder: "Search",
        onChangeText: (event) => handleFilter(event.nativeEvent.text),
      },
    });
  }, [navigation, items]);

  const handleFilter = (searchTerm) => {
    const normalizedSearchTerm = searchTerm.toUpperCase().normalize();
    setFilteredItems(
      items.filter((item) => 
        item.Ingredient_name.toUpperCase().normalize().includes(normalizedSearchTerm)
      )
    );
  };

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
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category || "Unnamed Category"} value={category} />
        ))}
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
});
