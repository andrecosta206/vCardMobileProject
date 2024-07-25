import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, Alert } from 'react-native';
import ConfirmButton from '../components/ConfirmButton';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PhoneNumber({navigation}) {
  const [phoneNumber, setPhone] = useState('');
  const [account,setAccount] = useState(null);

  const validateVcard = async() => {
    try{
      const vCardData = await getVCardAPI();
      //check data format
      console.log(vCardData);
      if(!vCardData){
        Alert.alert('Erro', 'Não foi possível acessar os dados do servidor.');
        return;
      }
      if(!vCardData.existsVcard){
        navigation.navigate('SignUp', { phone: phoneNumber });
        showErrorAlert();
        return;
      }
      if(vCardData.deleted){
        Alert.alert('Erro',vCardData.message);
        return;
      }
      Alert.alert('Sucesso', 'Número de telefone validado com sucesso.'); 
      navigation.navigate('SignIn', { phone: phoneNumber });
    }catch(error){
      console.log(error);
    }
  } 
  
  const getVCardAPI = () =>{
      let api = process.env.EXPO_PUBLIC_API_URL+'/api/taes/vcards/checkphonenumber';
      console.log(api)
      return fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
          "phone_number": phoneNumber,
        })
      })
      .then((response) => response.json())
      .catch((error) => console.error(error)) 
  }

  const handleLogin = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Número de telefone é obrigatório.');
      return;
    }
    if(phoneNumber.length != 9 || phoneNumber[0] != 9){
      Alert.alert('Erro', 'Número de telefone inválido (9xxxxxxxx).');
      return;
    }
    validateVcard();
  }

    const showErrorAlert = () => {
      Alert.alert('Registar Vcard', 'Este número não está registado, por favor registe-se.	');
    }
  
  
    return (
      <View style={styles.container}>
        <Image
          source={require('../img/logoTaes.png')}
          style={styles.image}
        />
        <Text style={styles.title}>Coloque o seu número:</Text>
        <TextInput
          keyboardType='numeric'
          style={styles.input}
          placeholder='Número'
          onChangeText={setPhone}
          value={phoneNumber}
        />
        <ConfirmButton 
          style={styles.button} 
          title="Confirmar" onPress={handleLogin} 
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
        marginBottom: 20,
      }
    });
  
