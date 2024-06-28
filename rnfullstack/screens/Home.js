import { View, Text, Image, FlatList, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';

const Home = ({ navigation }) => {
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
  }, [isLoading]);

  const goDetail = (menu_id) => {
    navigation.navigate('Detail', { menu_id: menu_id });
  }

  const renderItem = ({ item }) => (
    <View>
      <Pressable onPress={() => goDetail(item.menu_id)}>
      <Image source={{ uri: item.menu_image }}
        style={{ width: "100%", height: 333 }}
      />
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 20}}>{item.menu_name}</Text>
        <Text>{item.menu_detail}</Text>
      </View>
      </Pressable>
    </View>
  );

  return (
    <View>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.menu_id}
          refreshing={isLoading}
          onRefresh={() => setIsLoading(true)}
        />
    </View>
  );
};

export default Home;
