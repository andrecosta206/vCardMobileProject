// App.js
import React, { useEffect, useState, useRef} from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PhoneNumber from './src/screens/PhoneNumber';
import SignIn from './src/screens/SignIn';
import SignUp from './src/screens/SignUp';
import DashboardTabs from './src/screens/DashboardTabs';
import ListContacts from './src/screens/ListContacts';
import SendMoney from './src/screens/SendMoney';
import Dashboard from './src/screens/Dashboard';
import Poupanca from './src/screens/Poupanca';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import AsyncStorage from '@react-native-async-storage/async-storage';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [initialRoute, setInitialRoute] = useState('PhoneNumber');

  useEffect(() => {
    // clearAccount();
    const asyncWrap = async () => {
      const jsonValue = await AsyncStorage.getItem('account');
      const acc = jsonValue != null ? JSON.parse(jsonValue) : null
      console.log("Account",acc)
      if(acc != null){
        setAccount(acc);
        setInitialRoute('DashboardTabs');
      }
      setIsLoading(false);
    }
    asyncWrap();

    registerForPushNotificationsAsync().then(async token => setExpoPushToken(token));
    

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const clearAccount = async () => {
    try {
      await AsyncStorage.removeItem('account');
      console.log('Account cleared');
    } catch (error) {
      console.error('Failed to clear account from AsyncStorage', error);
    }
  };
  return (
    <>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="PhoneNumber" component={PhoneNumber} />
          <Stack.Screen name="SignIn" component={SignIn} initialParams={{expoToken: expoPushToken}}/>
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="ListContacts" component={ListContacts} />
          <Stack.Screen name="SendMoney" component={SendMoney} />
          <Stack.Screen name="DashboardTabs" component={DashboardTabs} initialParams={initialRoute == "DashboardTabs" ? {phone: account.username, access_token: account.access_token}:undefined}/>
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Poupanca" component={Poupanca} />
        </Stack.Navigator>
    </NavigationContainer>
      )
    }
    </>
  );

  
  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      token = (await Notifications.getExpoPushTokenAsync({ projectId: '58e9e366-0bfe-4bf1-9d84-488641b5cafe'})).data;
      // console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
    // console.log("Token",token);
    return token;
  }
}
 