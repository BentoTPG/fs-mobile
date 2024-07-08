import React, { useState, useContext } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../App';

const Login = () => {
  const navigation = useNavigation();
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    fetch('http://10.0.2.2:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.status === 'ok') {
          setUser({ user_id: response.user_id, token: response.token }); // ตั้งค่า user_id ใน UserContext
          console.log('User context set:', response.user_id, response.token); // เพิ่มการบันทึกเพื่อการดีบั๊ก
          navigation.navigate('Home');
        } else {
          alert(response.message);
        }
      })
      .catch(error => {
        console.error('Error during login:', error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../image/ade.jpg')} style={{ width: 350, height: 187 }} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          label="Password"
          secureTextEntry
          right={<TextInput.Icon icon="eye" />}
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
