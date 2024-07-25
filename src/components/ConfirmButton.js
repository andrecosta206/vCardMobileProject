import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const ConfirmButton = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.botao} onPress={onPress}>
        <Text style={styles.textoBotao}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 36,
    marginRight: 30
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
  },
});

export default ConfirmButton;
