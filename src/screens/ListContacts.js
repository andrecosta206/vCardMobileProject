import React, { useState, useEffect } from 'react';
import { View, Text, TextInput,Image, TouchableOpacity,FlatList, Alert,Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StyleSheet } from 'react-native';
import ConfirmButton from '../components/ConfirmButton';
import * as Contacts from 'expo-contacts';
import { useIsFocused } from '@react-navigation/native';
import { addContactAsync } from 'expo-contacts';



export default function ListContacts({ navigation , route}) {
    const [contacts, setContacts] = useState([]);
    const [newContactName, setNewContactName] = useState('');
    const [newContactNumber, setNewContactNumber] = useState('');
  
    useEffect(() => {
      fetchContacts();
      // console.log('ListContacts', contacts);
    }, []);
  
    //list contacts from phone
    const fetchContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [ Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          });
        
        // else{
        //   Alert.alert('Error', 'Permission not granted.');
        // }
        try{
          if(data.length > 0){
            const vcards = await getVCardAPI();
            // console.log('Vcards', vcards);
            if (!vcards) {
              Alert.alert('Error', 'Could not fetch vCard data');
              return;
            }
            
            const filterData = data.filter((contact) => 
              contact.phoneNumbers && 
              contact.phoneNumbers.length > 0 &&
              contact.phoneNumbers[0].number != route.params?.phone &&
              contact.phoneNumbers[0].number.length > 8
            );
            
            const cleanedData = filterData.map((contact) =>
              {
                let cleanedNumber = contact.phoneNumbers[0].number.replace(/[\s()-]/g, '');
                cleanedNumber = cleanedNumber.slice(-9);
                contact.phoneNumbers[0].number = cleanedNumber; 
                //console.log("Numero Limpo",cleanedNumber);
                return contact;
              }
            );
            //console.log('Cleaned Data', filterData[5]);
            const filteredData = cleanedData.filter((contact) =>
              contact.phoneNumbers[0].number.length == 9 &&
              contact.phoneNumbers[0].number[0] == 9
            );
            //console.log('Filtered Data', filteredData);


            //map filtered data to check if each contact has a vcard
            //console.log(filteredData);
            filteredData.map((contact) => 
              vcards.data.some((vcard) => 
                vcard.phone_number == contact.phoneNumbers[0].number
                  ) ? contact.vcard = true : contact.vcard = false);
            // console.log(filteredData[1]);
            setContacts(filteredData);
            
          }
          else{
            Alert.alert('Error', 'No contacts found.');
          }
        }
        catch(error){
          console.log(error);
        }
      }
      else{
        Alert.alert('Error', 'Permission not granted.');
      }
    };
    
    const handleAddContact = async () => {
      try {
        if (!newContactNumber) {
          // Show an alert or handle the case where name or number is missing
          Alert.alert('Erro', 'Numero de telemóvel é obrigatório');
          return;
        }
        if(newContactNumber.length != 9 || newContactNumber[0] != 9){
          Alert.alert('Erro', 'Número de telemóvel inválido');
          return;
        }
        if(contacts.some((contact) => contact.phoneNumbers[0].number === newContactNumber)){
          Alert.alert('Erro', 'Contacto já foi registado anteriormente');
          return;
        }
        const {status} = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            //console.log('New Contact', newContact);
            const contact = await addContactAsync({
              [Contacts.Fields.FirstName]:  newContactName,
              phoneNumbers: [{
                label: 'mobile',
                number: newContactNumber,
              }]
          });
          if(!contact){
            Alert.alert('Error', 'Error saving contact.');
            return;
          }
          Alert.alert('Success', 'Contact added successfully.');
            fetchContacts();
            setNewContactName('');
            setNewContactNumber(''); 
        } else {
          Alert.alert('Error', 'Error saving contact.');
        }
      } catch (err) {
        console.warn(err);
      }    //console.log('Error saving contact', err);
    };
  
    const handleSelectContact = (contact) => {
      if(!contact){
        if(newContactNumber.length != 9 || newContactNumber[0] != 9){
          Alert.alert('Erro', 'Número de telemóvel inválido');
          return;
        }
        if(newContactNumber == route.params?.phone){
          Alert.alert('Erro', 'Não pode enviar dinheiro para si mesmo');
          return;
        }
        navigation.navigate('SendMoney', { receiverContact: newContactNumber, 
          senderContact: route.params?.phone, 
          access_token: route.params?.access_token});
      }
      else{
        navigation.navigate('SendMoney', { receiverContact: contact.phoneNumbers[0].number, 
                senderContact: route.params?.phone, 
                access_token: route.params?.access_token});
        }
    };

    const getVCardAPI = () =>{
      let api = process.env.EXPO_PUBLIC_API_URL+'/api/taes/vcards';
      //console.log(process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+phoneNumber)
      return fetch(api, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+route.params?.access_token
        }
      })
      .then((response) => response.json())
      .catch((error) => console.error(error)) 
  }
  
  
  const renderItem = ({ item }) => {
    if(item.phoneNumbers[0] && item.phoneNumbers[0].number != route.params?.phone){
      //console.log("Contacts",contacts);
      if(item.vcard){
        return (
          <TouchableOpacity onPress={() => handleSelectContact(item)}>
            <View style={styles.card}>
              <View style={styles.cardDetails}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPhone}>{item.phoneNumbers[0].number}</Text>
              </View >
                <View style={styles.cardContainer}>
                  <Text style={styles.cardAccount}>Conta Vcard</Text>
                </View>
            </View>
          </TouchableOpacity>
        );
      }
      else{
        return (
          <View style={styles.card}>
            <View style={styles.cardDetailsDisabled}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardPhone}>{item.phoneNumbers[0].number}</Text>
            </View >
          </View>
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../img/logoTaes.png')} style={styles.image} />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newContactName}
          onChangeText={(text) => setNewContactName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="numeric"
          value={newContactNumber}
          onChangeText={(text) => setNewContactNumber(text)}
        />
        <View style={styles.buttonContainer}>
          <Button
            onPress={()=>handleSelectContact()}
            title="Enviar"
            color="#4677B2"
          />
        </View>
        <View style={styles.buttonContainer}>
        <Button 
          title="Adicionar Contacto" 
          onPress={handleAddContact}
          color="#4677B2"
        />
        </View>
      </View>     
        <Text style={styles.text}> Contactos </Text>
        {contacts && contacts.length > 0 ? 
          (<FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />):(
            <View style={styles.card}>
              <Text style={styles.info}> Não possui contactos com conta vcard ativada </Text>
            </View>
            )
        }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  buttonContainer: {
    width: '60%',
    marginHorizontal: '20%',
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    color: "grey",
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginStart: 20,
    marginEnd: 20,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 38,
    borderColor: '#4677B2',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: '10%',
    marginRight: 25,
    paddingHorizontal: 10,
  },
  image: {
      width: "100%",
      height: 70,
      marginBottom: 20,
  },
  newContactBtn: {
      marginBottom: 20,
      marginStart: 20,
      marginEnd: 20,
      borderRadius: 5,
      borderColor: "#4677B2",
      borderWidth: 2,
      alignItems: "center",
      padding: 10,
  },
  title: {
      fontSize: 18,
      color: "#4677B2",
      fontWeight: 'bold',
      fontFamily: 'serif'
  },
  text: {
      fontSize: 24,
      color: "#4677B2",
      fontWeight: 'bold',
      fontFamily: 'serif',
      marginStart: 20,
      marginEnd: 20,
      marginBottom: 20,
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#4677B2',
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 5,
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space_between',
  },
  cardDetailsDisabled: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space_between',
    opacity: 0.5,
  },
  cardAccount: {
    fontSize: 14,
    fontWeight: 'light',
    color: 'grey',
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#4677B2',  
  },
  cardPhone: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#616d79',
    marginTop: 3,
  }
});