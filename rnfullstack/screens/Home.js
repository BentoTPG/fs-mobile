import { View, Text, Image, FlatList, Pressable, StyleSheet, Button } from 'react-native';
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
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate('AddIngredient')}
          title="Add Ingredient"
        />
      ),
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
    <FlatList
      data={chunkedData}
      renderItem={renderRow}
      keyExtractor={(item, index) => index.toString()}
      refreshing={isLoading}
      onRefresh={() => {
        setIsLoading(true);
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
      }}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
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
