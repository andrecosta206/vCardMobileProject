import React, { useState,useEffect} from 'react';
import { Modal, Switch, View, Text, StyleSheet,TouchableOpacity, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default SettingsModal = ({ visible, onClose, settings,access_token}) => {
    const [ notifications, setNotifications] = useState();
    const [ spareChange, setSpareChange ] = useState();
    const [ vcard, setVcard ] = useState();
    const navigation = useNavigation();

  
  useEffect(() => {
    if(visible){
      setNotifications(settings[0]);
      setSpareChange(settings[1]);
      setVcard(settings[2]);
    }
  },[visible]);

  const clearAccount = async () => {
    try {
      await AsyncStorage.removeItem('account');
      console.log('Account cleared');
    } catch (error) {
      console.error('Failed to clear account from AsyncStorage', error);
    }
  };

  const saveSettings = async() => {
    const response = await setNotificationsAPI();
    // console.log("Response",response);
    if(!response){
      Alert.alert('Erro', "Não foi possível salvar as configurações");
      return;
    }
    
    Alert.alert('Sucesso', "Configurações salvas com sucesso");
    onClose();
  }

  const setNotificationsAPI = () => {
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+vcard+'/settings';
    // console.log(api)
    return fetch(api, {
      method: 'PATCH',
      headers: {
          Accept: "application/json",
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+access_token,
      },
      body: JSON.stringify({
        "notification": notifications,
        "spare_change": spareChange,
      })
    })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
  }

  const deleteVcardAPI = () => {
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+vcard;
    console.log(api)
    return fetch(api, {
      method: 'DELETE',
      headers: {
          'Accept': "application/json",
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+access_token
      },
      body: JSON.stringify({
        "taes":true
      })
    })
    .then((response) => response.json())
    .catch((error) => console.log(error))
  }

  const deleteVcard = async() => {
    const response = await deleteVcardAPI();
    console.log("Response",response);
    if(!response){
      Alert.alert('Erro', "Não foi possível apagar o Vcard");
      return;
    }
    if(!response.success){
      Alert.alert('Erro', response.message);
      return;
    }
    else{
      Alert.alert('Sucesso', "Vcard apagado com sucesso");
      clearAccount();
      navigation.navigate('PhoneNumber');
    }
  }

  const handleDelete = () => {
    Alert.alert(
      "Confirmation",
      "Are you sure you want to delete the vCard?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress:  () => {
          deleteVcard();
          // Your delete logic here
          console.log("OK Pressed");
          onClose();
        }}
      ]
    );
    
    
  }

 
  return (
    <Modal visible={visible} onRequestClose={onClose} transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.setting}>
            <Text style={styles.Text}>Notifications</Text>
            <Switch style={styles.switch}
              value={notifications}
              onValueChange={(newValue) => setNotifications(newValue)}
            />
          </View>
          <View style={styles.setting}>
            <Text style={styles.Text}>Spare Change</Text>
            <Switch style={styles.switch}
              value={spareChange}
              onValueChange={(newValue) => setSpareChange(newValue)}
            />
          </View>

          {/* touchableopacity to delete vcard */}
          <TouchableOpacity onPress={handleDelete} style={styles.deleteVcard}>
            <Text style={styles.deleteVcardText}>Apagar Vcard</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={saveSettings} style={styles.voltar}>
            <Text style={styles.deleteVcardText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 100 
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    paddingTop: 10,
    borderRadius: 20,
    height: '50%',
    width: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#f8f8f8", // Lighter color for subtlety
    borderRadius: 10, // Smaller radius for subtlety
    padding: 10, // Add some padding
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1, // Lower opacity for subtlety
    shadowRadius: 2, // Smaller radius for subtlety
    elevation: 2 // Lower elevation for subtlety
  },
  Text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4677B2',
    fontFamily: 'serif'
  },
  //make switch a bit bigger than default size
  switch:{
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]
  },
  deleteVcard: {
    backgroundColor: '#B80F0A',
    borderRadius: 10,
    width: '45%',
    padding: 15,
    marginTop: 10,
    marginLeft: 25,
    alignItems: 'center',
  },
  deleteVcardText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  voltar: {
    backgroundColor: '#4677B2',
    borderRadius: 10,
    width: '45%',
    padding: 15,
    marginTop: 20,
    //allign in the center
    marginLeft: "26%",
    alignItems: 'center',
  },
});


