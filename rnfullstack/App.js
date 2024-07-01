import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Detail from './screens/Detail';
import AddIngredient from './screens/AddIngredient';

const Stack = createNativeStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
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
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}
