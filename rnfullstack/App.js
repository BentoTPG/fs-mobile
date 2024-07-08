import React, { createContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Detail from './screens/Detail';
import AddIngredient from './screens/AddIngredient';
import UserIngredients from './screens/UserIngredients';
import Login from './screens/Login';
import Register from './screens/Register';

const Stack = createNativeStackNavigator();

// Create a Context for user information
export const UserContext = createContext();

function MyStack() {
  const [user, setUser] = useState(null); // Add state for user information

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Detail"
          component={Detail}
        />
        <Stack.Screen
          name="AddIngredient"
          component={AddIngredient}
          options={{ title: 'Add Ingredient' }}
        />
        <Stack.Screen
          name="UserIngredients"
          component={UserIngredients}
          options={{ title: 'User Ingredients' }}
        />
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
