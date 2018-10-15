// TODO: continue to monitor react native / ios's support of AudioContext.
// If at some point it is supported, a react native app could be made

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Util from "../shared/Util";

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Now I'm Happy. 3902 mod 27 = { Util.mod(3902, 27) }</Text>
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
