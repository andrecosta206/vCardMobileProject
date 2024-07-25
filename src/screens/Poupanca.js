import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity,  Image, TextInput,Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsModal from '../components/settings';

export default function Poupanca({route}) {
  const [piggyBankBalance, setPiggyBankBalance] = useState(undefined);
  const [balance, setBalance] = useState(undefined); //user.balance
  const [user,setUser] = useState([]);  
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState([false, false, route.params?.phone]);
  const [value, setValue] = useState('');

  //get value
  //check if value is less than balance
  //update balance and piggybank

  useFocusEffect(
    React.useCallback(() => {
      handleUserData();
      // console.log("PiggyBankBalance", piggyBankBalance);
      // console.log("Balance", balance);
      console.log("Settings",settings);
    },[balance,piggyBankBalance])
  );

  const handleUserData = async() => {
    const vCardData = await getVcardDataAPI();
    console.log("VcardData", vCardData)
    if (!vCardData) {
      showErrorAlert();
      //go back to login or try again?
    }
    setUser(vCardData.data);
    try{
      //const auxBalance = ;
      let custom_data = 0;
      //console.log("Custom Data", custom_data);
      if(vCardData.data?.custom_data && vCardData.data?.custom_data.value){
        custom_data = vCardData.data?.custom_data.value;
      }
      setPiggyBankBalance(parseFloat(custom_data));
      const auxBalance = (parseFloat(custom_data)+parseFloat(vCardData.data.balance)).toFixed(2);
      setBalance(auxBalance);
      // console.log("PiggyBankBalance", piggyBankBalance);
      // console.log("Balance", balance);
      const custom_options = vCardData.data?.custom_options;
      if(custom_options.notification != null && custom_options.spare_change != null){
        setSettings([custom_options.notification,custom_options.spare_change,route.params?.phone]);
      }
    }catch(error){
      console.log(error);
    }
  }
  
  const getVcardDataAPI = async () =>{
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+route.params?.phone;
    // console.log(api)
    return fetch(api, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer '+route.params?.access_token,
      }
    })
    .then((response) => response.json())
    .catch((error) => console.error(error))
  }


  const handleActions = (action) => {
    setCurrentAction(action);
    setModalVisible(true);
  };

  const handlePiggyBank = async () => {
    if (!value.trim()) {
      Alert.alert('Error','O valor é obrigatório.');
      return;
    }
    const piggyBank = await PiggyBankAPI(value,currentAction);
    console.log("PiggyBank", piggyBank);
    if(!piggyBank.success){
      Alert.alert('Error', piggyBank.message);
      return;
    }
    setValue('');
    handleUserData();
    setModalVisible(false);
    Alert.alert('Success', piggyBank.message);
  }
  
  const PiggyBankAPI = () => {
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+route.params?.phone+'/piggybank';
    console.log(api)
    return fetch(api, {
      method: 'PATCH',
      headers: {
          Accept: "application/json",
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+route.params?.access_token,
      },
      body: JSON.stringify({
            "value": parseFloat(value.replace(',', '.')),
            "action": currentAction
      })
    })
    .then((response) => response.json())
    .catch((error) => console.log(error))
  }




  return (
    <View>
      <Image source={require('../img/logoTaes.png')} style={styles.image} />
      <View style={styles.settings}>
        <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
          <Image source={require('../img/settings.png')} style={{width: 30, height: 30}} />
        </TouchableOpacity>
      </View>
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        settings ={settings? settings : []}
        access_token = {route.params?.access_token}
      />
      <View style={styles.moneyContainer}>
          <Text style={styles.amountText}>{balance !== undefined ? `${balance}€` : 'Loading ...'} </Text>
      </View>
      <View style={styles.piggyContainer}>
          <Text style={styles.piggyText}>{piggyBankBalance !== undefined ? `${piggyBankBalance}€` : 'Loading...'} </Text>
      </View>
      <View style={styles.buttonContainer}>

        <TouchableOpacity style={styles.botao} onPress={() => handleActions('save')}>
          <Text style={styles.textoBotao} > Poupar </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao} onPress={() => handleActions('withdraw')}>
          <Text style={styles.textoBotao} > Retirar </Text>
        </TouchableOpacity>
      </View>
      
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContent}>
          <Text style={styles.titleModal}>Insira o Valor</Text>
          <TextInput style={styles.input} placeholder="Valor" keyboardType="numeric" onChangeText={text => setValue(text)} value={value} />
          
          <TouchableOpacity style={styles.botao} onPress={handlePiggyBank}>
            <Text style={styles.textoBotao} > Confirmar </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={() => setModalVisible(false)}>
            <Text style={styles.textoBotao} > Cancelar </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
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
  settings: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    marginEnd: 20,
    marginBottom: 10,
  },
  image: {
      width: "100%",
      height: 70,
      marginBottom: 20,
  },
  moneyContainer: {
    marginBottom: 5,
    marginStart: 20,
    marginEnd: 20,
    borderRadius: 5,
    borderColor: "#4677B2",
    borderWidth: 2,
    alignItems: "center",
    padding: 10,
  },
  piggyContainer: {
    marginBottom: 7,
    marginStart: 90,
    marginEnd: 90,
    borderRadius: 10,
    borderColor: "#4677B2",
    borderWidth: 1,
    alignItems: "center",
    padding: 5,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4677B2',
    fontFamily: 'serif'

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#4677B2',
    padding: 10,
    borderRadius: 2,
    marginTop: 10,
    paddingHorizontal: 30,
    width: 150,
    alignSelf: 'center',
  },
  textoBotao: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'serif'
  },
  titleModal: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4677B2',
    fontFamily: 'serif',
    padding: 10,
    alignSelf: 'center',
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
    fontFamily: 'serif',
    color: '#4677B2',
    fontWeight: 'bold',
  },
  modalContent: {
    marginTop: 50,
    marginBottom: 50,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
});