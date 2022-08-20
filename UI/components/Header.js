import React from "react";
import { Text, StyleSheet, View, StatusBar } from "react-native";

export default function Header(props) {
  return (
    <View style={styles.header}>
      <Text style={styles.headline}>{"Welcome " + props.userName + "!"}</Text>
      <Text style={styles.text}>I am your gardening assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: StatusBar.currentHeight,
    height: 80,
    width: "100%",
    backgroundColor: "#4c924d",
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    color: "#fafce6",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 5,
  },
  text: {
    color: "#fafce6",
    fontSize: 14,
    marginTop: 10,
    paddingHorizontal: 20,
  },
});
