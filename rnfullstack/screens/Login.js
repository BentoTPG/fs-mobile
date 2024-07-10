import React, { useState, useContext } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const Login = () => {
  const navigation = useNavigation();
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for showing/hiding password

  const handleLogin = async () => { // Use async/await for better error handling
    try {
      const response = await fetch('https://fridgetofeast-a95f6e626f53.herokuapp.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setUser({ user_id: data.user_id, token: data.token });
        navigation.navigate('Home');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again.'); // User-friendly error message
    }
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.imageContainer}>
        <Image source={require('../image/ade.jpg')} style={{ width: 350, height: 187 }} />
      </View> */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          label="Password"
          secureTextEntry={!showPassword}
          right={
          <TextInput.Icon
            icon={() => (
              <Icon 
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="grey"
              />
            )}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        value={password}
        onChangeText={text => setPassword(text)}
        style={styles.input}
      />
      </View>
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleLogin}>
          Login
        </Button>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Don't have an account? Register here</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    alignSelf: 'center',
    paddingBottom: 14,
  },
  inputContainer: {
    paddingBottom: 14,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    alignSelf: 'center',
    width: '50%',
  },
  registerText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#6200EE',
    textDecorationLine: 'underline',
  },
});
