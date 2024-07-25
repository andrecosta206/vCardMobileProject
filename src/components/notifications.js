import React, { useState, useEffect} from 'react';
import { Modal, View, Text, StyleSheet,TouchableOpacity, FlatList,Alert, Image} from 'react-native';


export default NotificationsModal = ({ visible, onClose,vcard}) => {
    const [ notifications, setNotifications] = useState();
    const [readNotifications, setReadNotifications] = useState()
    
    useEffect(() => {
        if (visible) {
            handleNotifications();
        }
    },[visible]);
    
    const handleNotifications = async () => {
        try{
            const vcard = await getVcardDataAPI();
            console.log("Vcard", vcard);
            if (!vcard) {
                showErrorAlert();
                return ;
            }
            if(vcard.data?.custom_data.notifications){
                const notificationsAux = vcard.data?.custom_data.notifications;
                setNotifications(notificationsAux);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    const getVcardDataAPI = async () =>{
        let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+vcard.phone;
        // console.log(api)
        return fetch(api, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+vcard.access_token,
            }
        })
        .then((response) => response.json())
        .catch((error) => {
            console.error(error);
        });
    }

    useEffect(() => { 

    }, [notifications]);

    const handleRead = async(notificacao) => {
        let changedNotifications = [...notifications];
        console.log("Notificacao",changedNotifications)
        notificacao.read = true;
        const index = changedNotifications.findIndex(n => n.id === notificacao.id);
        if (index !== -1) {
            changedNotifications[index] = notificacao;
            setNotifications([...changedNotifications]);
        }
        console.log("ChangedNotifications",changedNotifications);  
    }

    const saveReadStatus = async() => {
        try{
            const response = await setNotificationsReadAPI();
            if(!response || !response.success){
                Alert.alert('Erro', "Não foi possível salvar as configurações");
                return;
            }
            onClose();
        }
        catch(error){
            console.log(error);
        }
    }

    const setNotificationsReadAPI = () =>{
        let api = process.env.EXPO_PUBLIC_API_URL+'/api/vcards/'+vcard.phone+'/markreadnotifications';
        // console.log(api)
        return fetch(api, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+vcard.access_token
            },
            body: JSON.stringify({
                "notifications": notifications,
            })
        })
        .then((response) => response.json())
        .catch((error) => {
            console.error(error);
        });
    }

    const renderItem = ({ item }) => {
        // console.log("Notification",item);
        return (
            
            <View style={ item.read ? {...styles.notificationContainer, backgroundColor: 'lightgray'} : styles.notificationContainer}>
                <TouchableOpacity onPress={() => handleRead(item)} disabled={item.read}>
                    <Image style={styles.image} source={item.read ? require('../img/read_notification.png') : require('../img/unread_notification.png')} />
                </TouchableOpacity>
                <View style={styles.card}>
                    {item.description ?
                        (
                            <View style={styles.notificationCard}>
                                <Text style={styles.notificationMessage}>{item.message}</Text>
                                <Text style={styles.notificationDescription}>{item.description}</Text>
                            </View>
                        ):(
                            <Text style={styles.notificationMessage}>{item.message}</Text>
                        )
                    }
                </View>
            </View>
        );
    }
    // console.log("Notifications",notifications);
    return (
        <Modal visible={visible} onRequestClose={onClose} transparent={true}>
            <View style={styles.centeredView}>
                
                <View style={styles.modalView}>
                    <Text style={styles.title}>Notificações</Text>
                    {notifications && notifications.length>0? 
                        (
                            <FlatList
                                data={notifications}
                                keyExtractor={(item) => item.id}
                                renderItem={renderItem}                        
                            />
                        ):( 
                            <Text style={styles.text}>Não possui notificações</Text>
                        )
                    }
                    <TouchableOpacity onPress={saveReadStatus} style={styles.voltar}>
                        <Text style={styles.voltarText}>Voltar</Text>
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
    justifyContent: "space-between",
    margin: 20,
    backgroundColor: "white",
    paddingTop: 10,
    borderRadius: 20,
    maxHeight: '80%',
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
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    minHeight: 60,
    borderRadius: 5,
    borderColor: "#4677B2",
    borderWidth: 1,
    padding: 10,
  },
  card: {
    marginStart: 10,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'serif',
    maxWidth: 250
  },
  notificationDescription: {
    fontSize: 12,
    fontFamily: 'serif',
    marginLeft: 10,
  },
  notificationCard: {
    flexDirection: 'column'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4677B2',
    fontFamily: 'serif',
    marginStart: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: 'serif',
    marginStart: 20,
    marginEnd: 20,
    padding: 50,
  },
  voltarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  voltar: {
    backgroundColor: '#4677B2',
    borderRadius: 10,
    width: '46%',
    padding: 15,
    marginBottom: 20,
    marginLeft: "27%",
    alignItems: 'center',
  },
});

