import React, { useEffect, useState} from 'react';
import { View, Modal, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ConfirmButton from '../components/ConfirmButton';

import SettingsModal from '../components/settings';


export default function SendMoney({ navigation, route }) {
  const [transactionAmount, setTransactionAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [confirmation_code, setConfirmationCode] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState([false, false, route.params?.senderContact]);


  useEffect(() => {
    console.log("Sender: ", route.params?.senderContact)
    console.log("Receiver:", route.params?.receiverContact)
    handleUserData();
    console.log("Settings", settings)
    // Fetch existing contacts from AsyncStorage on component mount
  }, []);

  const handleConfirmationCode = async () => {
    if (!confirmation_code.trim()) {
      Alert.alert('PIN incorreto');
      return;
    }
    try{
      const confirmationCodeResponse = await checkConfirmationCodeAPI();
      //const response = {isConfirmationCodeCorrect: false};
      //console.log("Response",confirmationCodeResponse)
      if(confirmationCodeResponse.isConfirmationCodeCorrect == false){
        showErrorAlert(confirmationCodeResponse.message);
        return;
      }
      setPinModalVisible(false);
      const transactionResponse = await sendMoneyAPI();
      console.log("Response",transactionResponse)
      if(!transactionResponse.success){
        showErrorAlert(transactionResponse.message);
        return;
      }
      //websockets and notifications
      navigation.navigate('DashboardTabs', { phone: route.params?.senderContact });
      Alert.alert("Transação Bem Sucedida",transactionResponse.message);
    }
    catch(error){
      console.log(error);
    }
  }

  const showSuccessAlert = (message) => {
    Alert.alert('Sucesso', message);
  };

  const showErrorAlert = (message) => {
    Alert.alert('Erro', message);
  }

  const handleUserData = async() => {
    try{
      const vCardData = await getVcardDataAPI();
      console.log("VcardData", vCardData);
      if (!vCardData) {
        showErrorAlert("Erro", "Erro ao obter dados do utilizador");
        //go back to login or try again?
      }
      const custom_options = vCardData.data?.custom_options;
      if(custom_options.notification != null && custom_options.spare_change != null){
        //console.log("Custom Options", custom_options);
        setSettings([custom_options.notification,custom_options.spare_change,route.params?.senderContact]);
      }
    }
    catch(error){
      console.log(error);
    }
  }

  const getVcardDataAPI = async () =>{
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+route.params?.senderContact;
    console.log(api)
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

  const sendMoneyAPI = ()  => {
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/transactions';
    console.log(api)
    return fetch(api, {
      method: 'POST',
      headers: {
          Accept: "application/json",
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+route.params?.access_token
      },
      body: JSON.stringify({
            "vcard": route.params?.senderContact,
            "value": parseFloat(transactionAmount.replace(',', '.')),
            "description": newDescription,
            'type': 'D',
            "payment_ref": route.params?.receiverContact,
            "payment_type": "VCARD",
            "spare_change": settings[1]
      })
    })
    .then((response) => response.json())
    .catch((error) => console.log(error))
  }

  const checkConfirmationCodeAPI = () => {
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+route.params?.senderContact+ "/checkconfirmationcode";
    console.log(api)
    return fetch(api, {
      method: 'POST',
      headers: {
          Accept: "application/json",
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+route.params?.access_token
      },
      body: JSON.stringify({
            "confirmation_code": confirmation_code,
      })
    })
    .then((response) => response.json())
    .catch((error) => console.log(error))
  }

  const verifyVcardExistsAPI = () => {
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/taes/vcards/checkphonenumber';
    console.log(api)
    return fetch(api, {
      method: 'POST',
      headers: {
          Accept: "application/json",
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
            "phone_number": route.params?.receiverContact,
      })
    })
    .then((response) => response.json())
    .catch((error) => console.log(error))
  }

  const handleSendMoney = async() => {
    if (!transactionAmount.trim()) {
      Alert.alert('Error', 'Amount is Required.');
      return;
    }
    console.log("Here", route.params?.senderContact)
    try{
      const response = await verifyVcardExistsAPI();
      console.log("Response",response)
      if(!response.existsVcard){
        //enviar notificacao para este numero de telefone para ver se quer criar conta
        navigation.navigate('ListContacts', { phone: route.params?.senderContact });
        showErrorAlert(response.message);  
        return;
      }
      if(response.deleted){
        Alert.alert('Vcard ' + route.params?.receiverContact + ' foi eliminado.', 'Nao é possivel enviar dinheiro para este numero de telefone.');
        navigation.navigate('ListContacts', { phone: route.params?.senderContact });
        return;
      }
      setPinModalVisible(true);
    }
    catch(error){
      console.log(error);
    }
  }
  
  return (
    <View style={styles.container}>
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
      />
      
      <View style={styles.inputContainer}>
        <View style={styles.amountContainer}>
          <Text style={styles.title}> Valor a enviar </Text>
          <TextInput
            keyboardType='numeric'
            placeholder="0.00€"
            onChangeText={(text) => setTransactionAmount(text)}
          />
        </View>
        <Text style={styles.text}> Descrição </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex:Parabens"
          onChangeText={(text) => setNewDescription(text)}
        />
        
        <ConfirmButton 
          title="Enviar" 
          onPress={handleSendMoney}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={pinModalVisible}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.pinInputContainer}>
            <TextInput
              style={styles.input}
              secureTextEntry
              keyboardType='numeric'
              placeholder="Enter your PIN"
              onChangeText={(text) => setConfirmationCode(text)}
            />
            <TouchableOpacity style={styles.botao} onPress={handleConfirmationCode}>
              <Text style={styles.textoBotao} > Confirmar </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botao} onPress={() => setPinModalVisible(false)}>
              <Text style={styles.textoBotao} > Cancelar </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  settings: {
    flexDirection: 'row',
   justifyContent: 'flex-end', 
   marginBottom: 10,
   marginEnd: 20
  },
  pinInputContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  amountContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
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
      fontSize: 18,
      color: "#4677B2",
      fontWeight: 'bold',
      fontFamily: 'serif',
      marginStart: '10%',
      marginEnd: 20,
      marginBottom: 10,
  },
  contactItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: 'grey',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 2,
      borderColor: '#4677B2',
      borderRadius: 5,
      marginHorizontal: 20,
      marginBottom: 5,

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
  }


});