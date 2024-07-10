import React, { createContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

import Home from './screens/Home';
import Login from './screens/Login';
import Register from './screens/Register';
import AddIngredient from './screens/AddIngredient';
import UserIngredients from './screens/UserIngredients';
import Detail from './screens/Detail';

export const UserContext = createContext();

const Stack = createStackNavigator();

function MyStack() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp > currentTime) {
            setUser({ token });
          } else {
            // Token expired
            await AsyncStorage.removeItem('userToken');
          }
        }
      } catch (error) {
        console.error('Error checking token:', error);
        // Handle error (e.g., show error message)
      }
      setIsLoading(false);
    };

    checkToken();
  }, []);

  if (isLoading) {
    return null; // Or display a loading spinner
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: true }} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="AddIngredient" component={AddIngredient} options={{ headerShown: true }} />
        <Stack.Screen name="UserIngredients" component={UserIngredients} />
        <Stack.Screen name="Detail" component={Detail} />
      </Stack.Navigator>
    </UserContext.Provider>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}
