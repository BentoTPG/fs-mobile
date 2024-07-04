import { View, Text, FlatList, Pressable, StyleSheet, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function AddIngredient() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

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
    console.log('Confirmed Ingredients:', selectedIngredients);

    fetch('http://10.0.2.2:5000/api/add_ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredient_names: selectedIngredients,
      }),
    })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        console.log('Ingredients added successfully:', response.results);
        setSelectedIngredients([]); // เคลียร์การเลือกหลังจากส่งข้อมูลสำเร็จ
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

  useEffect(() => {
    fetch('http://10.0.2.2:5000/api/ingredients')
      .then(res => res.json())
      .then((result) => {
        setItems(result);
        setFilteredItems(result);
        setIsLoading(false); // เปลี่ยนสถานะการโหลดเป็น false หลังจากโหลดข้อมูลเสร็จสิ้น
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);

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
      <FlatList
        data={chunkedData}
        renderItem={renderRow}
        keyExtractor={(item, index) => index.toString()}
        refreshing={isLoading}
        onRefresh={() => {
          setIsLoading(true);
          fetch('http://10.0.2.2:5000/api/ingredients')
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
        }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
});
