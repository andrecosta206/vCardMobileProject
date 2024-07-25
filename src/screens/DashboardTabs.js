import React, { useState,useEffect }  from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image } from 'react-native';
import Movimentos from './Movimentos';
import Poupanca from './Poupanca';
import Dashboard from './Dashboard';

const Tab = createBottomTabNavigator();

const DashboardTabs = ({route}) => {
  // useEffect(() => {   
  //   const asyncWrap = async () => {
  //     const jsonValue = await AsyncStorage.getItem('account');
  //     const acc = jsonValue != null ? JSON.parse(jsonValue) : null
  //     console.log("Account",acc)
  //     if(acc != null){
  //       setRouteParams(acc);
  //     }
  //     else{
  //       setRouteParams(route.params);
  //     }
  //     setIsLoading(false);
  //   }
  //   asyncWrap();
  // },[]);

  return (

    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
      name="Início" 
      component={Dashboard}
      initialParams= {{ phone: route.params?.phone, access_token: route.params?.access_token }}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color: focused ? '#4677B2' : 'grey' }}>Home</Text>
          ),
          tabBarIcon: ({ focused, color, size }) =>
            <Image source={require('../img/home.png')}  /> ,
        }}
      />
      <Tab.Screen 
        name="Movimentos"
        component={Movimentos}
        initialParams={{ phone: route.params.phone, access_token: route.params.access_token}}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color: focused ? '#4677B2' : 'grey' }}>Movimentos</Text>
          ),
          tabBarIcon: ({ focused, color, size }) =>
            <Image source={require('../img/list.png')}  /> ,
        }}
      />
      <Tab.Screen 
        name="Poupanca" 
        component={Poupanca}
        initialParams= {{ phone: route.params.phone,access_token: route.params.access_token }}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color: focused ? '#4677B2' : 'grey' }}>Poupança</Text>
          ),
          tabBarIcon: ({ focused, color, size }) =>
            <Image source={require('../img/savings.png')} /> ,
        }}
      />
    </Tab.Navigator>
  );
};

export default DashboardTabs;
