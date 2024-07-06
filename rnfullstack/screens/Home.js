import { View, Text, Image, FlatList, Pressable, StyleSheet, Button, TouchableOpacity, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFiltered, setShowFiltered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('http://10.0.2.2:5000/api/food_database')
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

  const fetchFilteredData = () => {
    fetch('http://10.0.2.2:5000/api/matching_menus')
      .then(res => res.json())
      .then((result) => {
        setFilteredItems(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  };

  const handleFilterToggle = () => {
    if (showFiltered) {
      setFilteredItems(items);
    } else {
      fetchFilteredData();
    }
    setShowFiltered(!showFiltered);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const normalizedSearchTerm = text.toUpperCase().normalize();
    setFilteredItems(
      items.filter((menu) => 
        menu.menu_name.toUpperCase().normalize().includes(normalizedSearchTerm)
      )
    );
  };

  const goDetail = (menu_id) => {
    navigation.navigate('Detail', { menu_id });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLargeTitle: true,
      headerSearchBarOptions: {
        placeHolder: "Search",
        onChangeText: (event) => handleSearch(event.nativeEvent.text),
      },
      headerRight: () => (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddIngredient')}
        >
          <Text style={styles.addButtonText}>Add Ingredient</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, items]);

  const renderItem = ({ item }) => (
    <Pressable onPress={() => goDetail(item.menu_id)} style={styles.featureContainer}>
      <Image 
        source={{ uri: item.menu_image }}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.menuName}>{item.menu_name}</Text>
      </View>
    </Pressable>
  );

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      {item.map((menu, index) => (
        <View key={index} style={styles.column}>
          {renderItem({ item: menu })}
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
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleFilterToggle}
      >
        <Text style={styles.toggleButtonText}>
          {showFiltered ? 'Show All Menus' : 'Show Matching Menus'}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={chunkedData}
        renderItem={renderRow}
        keyExtractor={(item, index) => index.toString()}
        refreshing={isLoading}
        onRefresh={fetchData}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
      <Button
        title="User Ingredients"
        onPress={() => navigation.navigate('UserIngredients')}
      />
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
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  addButton: {
    marginRight: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});
