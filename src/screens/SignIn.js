import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, Button, StyleSheet, Alert } from 'react-native';
import ConfirmButton from '../components/ConfirmButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignIn({navigation, route}) {
  const [password, setPassword] = useState('');
  // console.log("Phone",route.params.phone)

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Erro','Palavra-passe obrigatória');
      return;
    }
    const response = await loginAPI();
    // console.log("Response",response)
    if(!response.access_token){
      Alert.alert('Erro', 'Credenciais inválidas');
      return;
    }
    showSuccessAlert(response.message);
    setAccount(route.params.phone,password,response.access_token)
    console.log("Response",route.params.phone)
    console.log("Response",password)
    console.log("Response",response.access_token)
    navigation.navigate('DashboardTabs',{phone: route.params.phone,access_token: response.access_token});
  }

  const setAccount = async (username,password,access_token) => {
    try {
      const jsonValue = JSON.stringify({"username":username,"password":password, "access_token":access_token})
      await AsyncStorage.setItem('account', jsonValue)
      console.log("Account",jsonValue)
    } catch(e) {
      Alert.alert('Erro', 'Não foi possível guardar os dados da conta');
    }
  
    console.log('Done.')
  }
    
  const loginAPI = () => { 
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/auth/login';
    console.log(api)
    return fetch(api, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      body: JSON.stringify({
        "username": route.params.phone,
        "password": password,
        "token": route.params.expoToken
      })
    })
    .then((response) => response.json())
    .catch((error) => console.error(error))
  }
  

  const showSuccessAlert = (message) => {
    Alert.alert('Bem-vindo', message);

  };

  const showErrorAlert = (message) => {
    Alert.alert('Palavra-passe incorreta', message);
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../img/logoTaes.png')}
        style={styles.image}
      />
      <Text style={styles.title}>Indique a sua Password:</Text>
      <TextInput
        secureTextEntry={true}
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
      <ConfirmButton         
        style={styles.button}
        title="Entrar" 
        onPress={handleLogin} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#4677B2',
    marginTop: 40,
    marginLeft: 25,
    fontFamily: 'serif'
  },
  input: {
    width: '80%',
    height: 38,
    borderColor: '#4677B2',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 25,
    marginRight: 25,
    paddingHorizontal: 10,
  },
  image:{
    width: '100%',
    height: 200,
    marginBottom: 20
  },
});
