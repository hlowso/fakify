import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Util from "../shared/Util";

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>7 mod 3 = {Util.mod(7, 4)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
