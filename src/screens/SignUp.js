import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, Alert } from 'react-native';
import ConfirmButton from '../components/ConfirmButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PIN({route , navigation}) {
  //ou retiramos input do phone e metemos so o numero de telefone que queremos criar ou entao temos de 
      //fazer validaacoes para ver se o telefone que alteramos no input ja existe ou nao
  const [phone, setPhone] = useState(route.params?.phone);
  const [confirmation_code, setConfirmation_code] = useState('');
  const [password, setPassword] = useState('');  
  // create const balance with 0 value

  const handleSignUp = () => {
    if (!phone.trim() || !password.trim() || !confirmation_code.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }
    signUp()
  }

  const signUp = async () => {

    const response = await setVCardAPI();
    console.log("Response",response.message)
    if(!response.data){
      Alert.alert('Erro', response.message);
      return;
    }
    Alert.alert('Sucesso', response.message);
    navigation.navigate('SignIn', { phone: response.data.phone_number });
  }

  const setVCardAPI = () => {
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards';
    //console.log(api)
    return fetch(api, {
      method: 'POST',
      headers: {
          Accept: "application/json",
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
            "phone_number": phone,
            "password": password,
            "password_confirmation": password,
            "confirmation_code": confirmation_code,
            "confirmation_code_confirmation": confirmation_code,
            "name":"TAES",
            "email": "taes"+phone+"@gmail.com"
      })
    })
    .then((response) => response.json())
    .catch((error) => console.log(error))      
    ;
  }

    return ( 
      <View style={styles.container}>
        <Image
          source={require('../img/logoTaes.png')}
          style={styles.image}
        />
        <Text style={styles.title}>Número:</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de Telemóvel"
          onChangeText={(text) => setPhoneNumber(text)}
          value={phone}
        />
        <Text style={styles.title}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
          value={password}
        />
        <Text style={styles.title}>PIN:</Text>
        <TextInput
          style={styles.input}
          keyboardType='numeric'
          secureTextEntry={true}
          placeholder="PIN"
          onChangeText={(text) => setConfirmation_code(text)}
          value={confirmation_code}
        />
        
        <ConfirmButton         
          style={styles.button}
          title="Criar Cartão" 
          onPress={handleSignUp} 
        />
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'left',
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    color: '#4677B2',
    marginLeft: 20,
    fontFamily: 'serif'
  },
  image:{
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  input: {
    width: 360,
    height: 30,
    borderColor: '#4677B2',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 25,
    marginRight: 25,
    paddingHorizontal: 10,
  },
});

