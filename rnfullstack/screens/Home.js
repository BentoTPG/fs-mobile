import { View, Text, Image, FlatList, Pressable, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);

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
  }, []);

  const handleFilter = (searchTerm) => {
    const normalizedSearchTerm = searchTerm.toUpperCase().normalize();
    setFilteredItems(
      items.filter((menu) => 
        menu.menu_name.toUpperCase().normalize().includes(normalizedSearchTerm)
      )
    );
  }

  const goDetail = (menu_id) => {
    navigation.navigate('Detail', { menu_id });
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Pressable onPress={() => goDetail(item.menu_id)}>
        <Image 
          source={{ uri: item.menu_image }}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.menuName}>{item.menu_name}</Text>
          <Text>{item.menu_detail}</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.menu_id}
        refreshing={isLoading}
        onRefresh={() => setIsLoading(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    marginBottom: 10,
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
  },
});
