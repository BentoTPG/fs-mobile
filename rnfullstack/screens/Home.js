import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';

const Home = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://10.0.2.2:5000/api/food_database')
      .then(res => res.json())
      .then((result) => {
        setItems(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);

  const renderItem = ({ item }) => (
    <View>
      <Text>{item.menu_name}</Text>
    </View>
  );

  return (
    <View>
      <FlatList
       data={items}
       renderItem={renderItem}
       keyExtractor={item => item.menu_id}
      />
    </View>
  );
};

export default Home;
