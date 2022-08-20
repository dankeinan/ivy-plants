import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function PlantCard(props) {
  const navigation = useNavigation();

  async function postAuthentication() {
    const response = await fetch(
      "https://functionapp220220419172755.azurewebsites.net/api/homepage?",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: props.userEmail,
          name: props.userName,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        props.setPlants(JSON.parse(data));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const cardPressed = () => {
    postAuthentication();
    navigation.navigate("PlantPage", {
      userName: props.userName,
      userEmail: props.userEmail,
      plantImage: props.plantImage,
      plantName: props.plantName,
      species: props.species,
      optimalMoisture: props.optimalMoisture,
      currentMoisture: props.currentMoisture,
      plantID: props.plantID,
    });
  };

  return (
    <Pressable
      style={{
        height: 180,
        width: "100%",
        flexDirection: "row",
        backgroundColor: "#4c924d",
        borderRadius: 10,
        borderWidth: 3,
        borderColor: "#4c924d",
        marginBottom: 20,
      }}
      onPress={cardPressed}
    >
      <View style={{ flex: 2 }}>
        <Image source={{ uri: props.plantImage }} style={styles.plantImage} />
      </View>
      <View
        style={{
          flex: 2,
          paddingLeft: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={styles.plantTextTitle}>{props.plantName}</Text>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text style={styles.plantTextDescription}>Plant species:</Text>
          <Text style={styles.plantTextDescription}>{props.species}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  plantImage: {
    flex: 1,
    width: null,
    height: null,
    borderRadius: 10,
    resizeMode: "cover",
  },
  plantTextTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fafce6",
  },
  plantTextDescription: {
    fontSize: 12,
    color: "#fafce6",
    marginTop: 5,
  },
});
