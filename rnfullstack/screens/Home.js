import { View, Text, Image, FlatList, Pressable, StyleSheet, Button, TouchableOpacity, TextInput } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../App'; // Import UserContext

export default function Home() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext); // Use UserContext to get user token
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFiltered, setShowFiltered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData(showFiltered);
  }, []);

  const fetchData = (filter = false) => {
    const apiUrl = filter
      ? 'https://fridgetofeast-a95f6e626f53.herokuapp.com/api/matching_menus'
      : 'https://fridgetofeast-a95f6e626f53.herokuapp.com/api/food_database';

    fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${user.token}`, // Include token in the request
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

  const handleFilterToggle = () => {
    setIsLoading(true);
    fetchData(!showFiltered);
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
      headerLeft: null,
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchTerm}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddIngredient')}
          >
            <Text style={styles.addButtonText}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, items, searchTerm]);

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
        onRefresh={() => fetchData(showFiltered)}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
      <Button
        title="User Ingredients"
        onPress={() => navigation.navigate('UserIngredients')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5', // ม่วงอ่อน
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  addButton: {
    marginRight: 10,
  },
  addButtonText: {
    color: '#6200EE', // ม่วงเข้ม
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: 12,
    backgroundColor: '#6200EE', // ม่วงเข้ม
    borderRadius: 25, // ขอบมนมากขึ้น
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
  },
  featureContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  textContainer: {
    padding: 12,
  },
  menuName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333', // สีเทาเข้ม
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
