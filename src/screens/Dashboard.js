import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Image,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import SettingsModal from '../components/settings';
import NotificationsModal from '../components/notifications';
import * as Notifications from 'expo-notifications';

export default function Dashboard({ navigation, route}) {

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [piggyBalance, setPiggyBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [settings, setSettings] = useState([false, false, route.params?.phone]);
  
  useFocusEffect(
    React.useCallback(() => {
      //fetchData(route.params?.phone);
      handleUserData();
      fetchTransaction();
      // console.log("PiggyBankBalance", piggyBalance);
    },[])
  );

  const handleUserData = async() => {
    try{
      const vCardData = await getVcardDataAPI();
      console.log("VcardData", vCardData);
      if (!vCardData) {
        showErrorAlert();
        return ;
      }
      setUser(vCardData.data);
      let custom_data = 0;
      if (vCardData.data?.custom_data && vCardData.data?.custom_data.value) {
          custom_data = vCardData.data?.custom_data.value;
      }    
      setPiggyBalance(custom_data);
      setBalance((parseFloat(custom_data) + parseFloat(vCardData.data.balance)).toFixed(2));

      const custom_options = vCardData.data?.custom_options;
      if(custom_options.notification!=null && custom_options.spare_change!=null){
        setSettings([custom_options.notification,custom_options.spare_change,route.params?.phone]);
      }
    }
    catch(error){
      console.log(error);
    }
  }
  

  const getVcardDataAPI = async () =>{
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+route.params?.phone;
    console.log(api)
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

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(handleUserData);
    return () => subscription.remove();
  }, []);

  const getTransactionsAPI = async () =>{
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+route.params?.phone+'/transactions';
    //console.log(api)
    return fetch(api, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer '+route.params?.access_token,
      },
    })
    .then((response) => response.json())
    .catch((error) => console.error(error))
  }

    const fetchTransaction = async () => {
      try {
        const response = await getTransactionsAPI();
        if(!response){
          Alert.alert('Something went wrong', 'Error retrieving data. Please try again.');
          return;
        }
        const filteredData = response.filter(transactions => transactions.payment_type === 'VCARD');
        const lastTransaction = filteredData[0];
        setTransactions(lastTransaction);
        //console.log("response", response);
      } catch (error) {
        console.error('Error fetching last transaction', error);
      }
    };

    const showErrorAlert = () => {
      Alert.alert('Something went wrong', 'Error retrieving data. Please try again.');
    };

  
  const handleSendMoney = () => {
    navigation.navigate('ListContacts', {phone: route.params?.phone, access_token: route.params?.access_token});
  };

  return (
    <View style={styles.container}>
      <Image source={require('../img/logoTaes.png')} style={styles.image} />
      <View style={styles.settings}>
        <TouchableOpacity onPress={() => setNotificationsModalVisible(true)}>
          <Image source={require('../img/notification.png')} style={{width: 30, height: 30}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
          <Image source={require('../img/settings.png')} style={{width: 30, height: 30}} />
        </TouchableOpacity>
      </View>

      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        vcard = {route.params}
      />

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
          <Text style={styles.piggyText}>{piggyBalance !== undefined ? `${piggyBalance}€` : 'Loading ...'} </Text>
      </View>

      

      {transactions ? (
        <>
          <View style={styles.moneyTransaction}>
            <Text style={styles.titleTransaction}>Último Movimento </Text>
            <View style={styles.transactionBox}>
              <View>
                <Text style={styles.lastTransaction}>{transactions.pair_vcard}</Text>
                <Text style={styles.lastTransaction}>{transactions.date}</Text>
              </View>
              <View style={styles.balanceTransaction}> 
                <Text style={styles.lastTransaction}> 
                  <Text style={transactions.type == "C" ? styles.green : styles.red}>
                    {transactions.type == "C" ? '+' : '-'}{transactions.value}€
                  </Text>
                </Text>
                <Text style={styles.lastTransaction}>{transactions.new_balance}€</Text>
              </View>
            </View>
          </View>
        </>
      ):(
        <>
          <View style={styles.moneyTransaction}>
            <Text style={styles.titleTransaction}>Último Movimento </Text>
            <View style={styles.transactionBox}>
              <Text style={styles.lastTransaction}>Não possui nenhum movimento registado! </Text>
            </View>
          </View>
        </>
      )}
        <View style={styles.sendMoney}>
          <TouchableOpacity style={styles.botao} onPress={handleSendMoney}>
            <Text style={styles.textoBotao} > Enviar Dinheiro </Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  green : {
    color: 'green',
    fontWeight: 'bold',
  },
  red : {
    color: 'red',
    fontWeight: 'bold',
  },
  image: {
    width: "100%",
    height: 70,
    marginBottom: 20,
  },
  settings: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    marginBottom: 10,
    marginEnd: 20
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
  moneyTransaction: {
    marginBottom: 20,
  },
  titleTransaction: {
    marginTop: 50,
    marginStart: 30,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4677B2',
    fontFamily: 'serif',
    padding: 10,
  },
  transactionBox: {
    padding: 10,
    borderRadius: 5,
    borderColor: "#4677B2",
    borderWidth: 2,
    marginBottom: 10,
    flexDirection: 'row',
    width: '80%',
    alignSelf: 'center',  
  },
  lastTransaction: {
    fontSize: 16,
  },
  balanceTransaction: {
    alignItems: 'flex-end',
    flex: 1,
  },
  sendMoney: {
    alignItems: 'center',
    marginTop: 36,
  },
  botao: {
    backgroundColor: '#4677B2',
    padding: 10,
    borderRadius: 2,
    marginTop: 10,
    width: 'fit-content',
    paddingHorizontal: 30
  },
  textoBotao: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'serif'
  }
});