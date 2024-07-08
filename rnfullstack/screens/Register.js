// Register.js
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const Register = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');

  const handleRegister = () => {
    fetch('http://10.0.2.2:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fname,
        lname,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.status === 'ok') {
          navigation.navigate('Login');
        } else {
          alert(response.message);
        }
      })
      .catch(error => {
        console.error('Error during registration:', error);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="First Name"
        value={fname}
        onChangeText={text => setFname(text)}
        style={styles.input}
      />
      <TextInput
        label="Last Name"
        value={lname}
        onChangeText={text => setLname(text)}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={text => setEmail(text)}
        style={styles.input}
      />
      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={text => setPassword(text)}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
