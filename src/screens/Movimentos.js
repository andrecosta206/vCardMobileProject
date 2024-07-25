import React, { useEffect, useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import {Calendar} from 'react-native-calendars';
import RadioGroup from 'react-native-radio-buttons-group';
import { Dropdown } from 'react-native-element-dropdown';
import SettingsModal from '../components/settings';


export default function Movimentos({ route, navigation }) {

  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState('T');
  const [selectedValueOrder, setSelectedValueOrder] = useState("date_desc");
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
    displayedDates: {},
  });

  const data = [
    { label: 'Valor Ascendente', value: 'value_asc' },
    { label: 'Valor Decrescente', value: 'value_desc' },
    { label: 'Data Mais Recente', value: 'date_desc' },
    { label: 'Data Mais Antiga', value: 'date_asc' },
  ];
  

  // Move the fetchTransactions function inside the Movimentos component
  const fetchTransactions = async () => {
    try {
      const response = await getTransactionsAPI();
      if(!response){
        Alert.alert('Erro', 'Não foi possível listar os movimentos, tente novamente mais tarde');
        return;
      }
      const filteredData = response.filter(transactions => transactions.payment_type === 'VCARD');
      // console.log("filteredData", filteredData);
      setTransactions(filteredData);
      //console.log("response", response);

    } catch (error) {
      console.error('Error fetching last transaction', error);
    }
  };

  const getTransactionsAPI = async () =>{
    let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+route.params?.phone+'/transactions';
    console.log(api)
    return fetch(api, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer '+route.params?.access_token
      },
      body: JSON.stringify({
        filter_start_date: selectedDates.startDate,
        filter_end_date: selectedDates.endDate,
        filter_by_type: selectedId,
        filter_by_value: selectedValueOrder,
      })
      
    })
    
    .then((response) => response.json())
    .catch((error) => console.error(error))
    
  }


  // useEffect(() => {
  //   // Initial fetchTransactions when the component mounts
  //   fetchTransactions();
  // }, []);

  // Use useLayoutEffect to add a listener when the screen is focused
  useLayoutEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      // Fetch transactions when the screen is focused
      fetchTransactions();
    });

    // Return a cleanup function to remove the listener when the component unmounts
    return () => {
      unsubscribeFocus();
    };
  }, [navigation]);

  

  const radioButtons = useMemo(() => ([
    {
        id: 'T', // acts as primary key, should be unique and non-empty string
        label: 'Todos',
        value: 'T'
    },
    {
        id: 'D',
        label: 'Débito',
        value: 'D'
    },
    {
        id: 'C',
        label: 'Crédito',
        value: 'C'
    }
]), []);



  // console.log(transactions); // Add this line to check the data
  console.log(selectedId)
  console.log(selectedValueOrder)
  console.log(selectedDates.startDate, selectedDates.endDate)

  const renderTransaction = ({ item }) => {
    return (
      <View style={styles.transactionBox}>
        <View>
          <Text style={styles.lastTransaction}>{item.pair_vcard}</Text>
          <Text style={styles.lastTransaction}>{item.date}</Text>
        </View>
        <View style={styles.balanceTransaction}> 
          <Text style={styles.lastTransaction}>  
            <Text style={item.type =="C" ? styles.green : styles.red}>
              {item.type =="C" ? '+' : '-'}{item.value}€
            </Text>
          </Text>
          <Text style={styles.lastTransaction}>{item.new_balance}€</Text>
        </View>
      </View>
    );
  };

  const handleFilter = () => {
    setModalVisible(true);
    }

    const handleConfirm = async () => {
      setModalVisible(false);
      await fetchTransactions();
    };

    const resetFilters = () => {
      setSelectedDates({ startDate: null, endDate: null, displayedDates: {} });
      setSelectedId('T');
      setSelectedValueOrder('date_desc');
    };

    const onDayPress = (day) => {
      let { startDate, endDate, displayedDates } = selectedDates;
    
      if (startDate == null || endDate != null) {
        startDate = day.dateString;
        endDate = null;
        displayedDates = { [day.dateString]: { startingDay: true, color: 'green', endingDay: true } };
      } else if (startDate != null && endDate == null) {
        endDate = day.dateString;
    
        if (isBeforeDay(day, startDate)) {
          displayedDates = { [day.dateString]: { startingDay: true, color: 'green', endingDay: true } };
          startDate = day.dateString;
        } else {
          displayedDates = getDatesBetween(startDate, endDate);
        }
      }
    
      setSelectedDates({ startDate, endDate, displayedDates });
    };

    
  const isBeforeDay = (day1, day2) => {
    const date1 = new Date(day1);
    const date2 = new Date(day2);
    return date1.getTime() <= date2.getTime();
  };

  const getDatesBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let dates = {};
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      dates[dt.toISOString().split('T')[0]] = {
        color: 'green',
        startingDay: dt.getTime() === start.getTime(),
        endingDay: dt.getTime() === end.getTime(),
      };
    }
    return dates;
  };

  return (
    <View>
      <Image source={require('../img/logoTaes.png')} style={styles.image} />
      
      <View style={styles.container}>
        <Text style={styles.titleTransaction}>Movimentos</Text>
        <TouchableOpacity style={styles.botao} onPress={handleFilter}>
          <Text style={styles.textoBotao} > Filtrar </Text>
        </TouchableOpacity>
        <Modal isVisible={isModalVisible} animationType = "fade">
          <View style={styles.modalContainer}>
              <Calendar 
                style={{
                  borderRadius:10,
                  elevation: 4,
                  margin: 40
                }}
                markingType={'period'}
                markedDates={selectedDates.displayedDates}
                onDayPress={onDayPress}
              />
            
            <Text style={styles.titleTransaction}>Tipo de Movimento:</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginEnd: 25, marginStart: 25}}>
            <RadioGroup 
              radioButtons={radioButtons} 
              onPress={setSelectedId}
              layout='row'
              selectedId={selectedId}
            />
            </View>
            
            <Text style={styles.titleTransaction}>Ordenar por:</Text>
            
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={data}
              maxHeight={300}
              labelField="label"
              dropdownPosition="top"
              valueField="value"
              placeholder="Select item"
              value={selectedValueOrder}
              onChange={item => {
                setSelectedValueOrder(item.value);
              }}
            />


            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginEnd: 25, marginStart: 25}}>

            <TouchableOpacity style={styles.modalBotao} onPress={resetFilters}>
              <Text style={styles.textoBotao}>Resetar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBotao} onPress={handleConfirm}>
              <Text style={styles.textoBotao}>Confirmar</Text>
            </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      {transactions && transactions.length > 0 ? (
          <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
        />
      ):(
        <>
          <View style={styles.transactionBox}>
            <Text style={styles.info}>Ainda não efetuou nenhuma transação</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginEnd: 25,
  },
  settings: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    marginEnd: 20
  },
  containerOrder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginEnd: 25,
    marginBottom: 20,
    marginStart: 25,
  },
  titleOrder: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    color: '#4677B2',
    fontFamily: 'serif',
  },
  modalContainer: {
    flex: 1, 
    backgroundColor:'white',
  },
  arrow: {
    width: 30,
    height: 30,
  },
  image: {
    width: "100%",
    height: 70,
    marginBottom: 20,
  },
  modalBotao: {
    backgroundColor: '#4677B2',
    padding: 10,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 25,
    paddingHorizontal: 30,
    height: 40, 
    alignSelf: 'center',
    },
  green: {
    color: 'green',
    fontWeight: 'bold',
  },
  red: {
    color: 'red',
    fontWeight: 'bold',
  },
  info: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 20,
    color: 'grey',
    fontFamily: 'serif',
    textAlign: 'center',
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
  botao: {
    backgroundColor: '#4677B2',
    padding: 10,
    borderRadius: 2,
    marginTop: 10,
    paddingHorizontal: 30,
    height: 40, 
  },
  textoBotao: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'serif'
  },
  lastTransaction: {
    fontSize: 16,
  },
  balanceTransaction: {
    alignItems: 'flex-end',
    flex: 1,
  },
  titleTransaction: {
    marginTop: 10,
    marginStart: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4677B2',
    fontFamily: 'serif',
    padding: 10,
  },
  dropdown: {
    marginHorizontal: 25,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
});