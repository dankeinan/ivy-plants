import React, { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Pressable,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";

export default function AddNewPlantScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const [plantName, onNameCahnged] = useState("");
  const [sesnorId, onSensorIDCahnged] = useState("");
  const [base64image, setBase64Image] = useState();
  const [plantSpecies, setPlantSpecies] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (base64image) postComputerVision();
  }, [base64image]);

  useEffect(() => {
    if (plantSpecies.length > 0) console.log(plantSpecies);
  }, [plantSpecies]);

  async function takePicture() {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.cancelled) {
      return;
    }

    setIsLoading(true);
    let base64 = await FileSystem.readAsStringAsync(result.uri, {
      encoding: "base64",
    });
    setBase64Image(base64);
  }

  async function postComputerVision() {
    const response = await fetch(
      "https://functionapp220220419172755.azurewebsites.net/api/ComputerVision?",
      {
        method: "POST",
        body: JSON.stringify({ image: base64image }),
      }
    )
      .then((response) => response.json())
      .then((data) => setPlantSpecies(data.plant_name));

    setIsLoading(false);
  }

  async function postPlantDetailsAsync() {
    const response = await fetch(
      "https://functionapp220220419172755.azurewebsites.net/api/addplant?",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: route.params.userEmail,
          plantName: plantName,
          plantSpecies: plantSpecies,
          plantImage: base64image,
          sensorID: sesnorId,
        }),
      }
    ).then((response) => {
      setIsLoading(false);
      if (response.status === 200) {
        Alert.alert("Add plant", "Plant added successfully!", [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("Homepage", {
                userName: route.params.userName,
                userEmail: route.params.userEmail,
                updatePlants: true,
              }),
          },
        ]);
      } else {
        Alert.alert("Add plant", "There was a problem Adding your plant", [
          {
            text: "OK",
            onPress: () => console.log("Add plant failed."),
          },
        ]);
      }
    });
  }

  async function validateDetails() {
    if (plantName == "Name" || plantName.length <= 2) {
      Alert.alert("Error", "Please update your plant Name.", [{ text: "OK" }]);
    } else {
      if (sesnorId == "Sensor ID" || sesnorId.length <= 4) {
        Alert.alert("Error", "Please update your Sensor ID.", [{ text: "OK" }]);
      } else {
        if (!plantSpecies) {
          Alert.alert(
            "Error",
            "We did not identify your plant, please take another picture.",
            [{ text: "OK" }]
          );
        } else {
          setIsLoading(true);
          postPlantDetailsAsync();
        }
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#4c924d" }}>
      <SafeAreaView style={styles.container}>
        <Header userName={route.params.userName} />
      </SafeAreaView>
      <View
        style={{
          backgroundColor: "#fafce6",
          flex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <View style={{ flex: 1, marginLeft: 20, marginTop: 20 }}>
          <Text style={styles.title}>Let's connect your new plant!</Text>
          <Text style={styles.text}>Insert your plant's details.</Text>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={{ paddingTop: 20 }}>
              <Text style={styles.text}>Enter your plant's name</Text>
              <TextInput
                style={styles.input}
                onChangeText={onNameCahnged}
                value={plantName}
                placeholder={"Name"}
              />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={{ paddingTop: 20 }}>
              <Text style={styles.text}>Enter your sensor ID</Text>
              <TextInput
                style={styles.input}
                onChangeText={onSensorIDCahnged}
                value={sesnorId}
                placeholder={"Sensor ID"}
              />
            </View>
          </TouchableWithoutFeedback>
          <View style={{ paddingTop: 20 }}>
            <Text style={styles.text}>Plant's picture</Text>
            <Pressable style={styles.buttonContainer} onPress={takePicture}>
              <Text style={styles.buttonText}>Take a picture</Text>
            </Pressable>
          </View>
        </View>
        {isLoading && (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        )}
        <View
          style={{
            backgroundColor: "#fafce6",
            alignContent: "center",
            alignItems: "center",
            marginBottom: 60,
          }}
        >
          <Pressable style={styles.buttonContainer} onPress={validateDetails}>
            <Text style={styles.buttonText}>Add my plant!</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
    color: "#4c924d",
  },
  text: {
    fontSize: 14,
    marginTop: 10,
    color: "#4c924d",
  },
  input: {
    height: 40,
    marginRight: 20,
    marginTop: 10,
    borderWidth: 1,
    color: "#4c924d",
    borderColor: "#4c924d",
    borderRadius: 10,
    padding: 10,
  },
  buttonContainer: {
    width: 150,
    height: 50,
    backgroundColor: "#4c924d",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 14,
    color: "#fafce6",
    padding: 10,
  },
  cameraContainer: {
    flex: 1,
    flexDirection: "row",
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1,
  },
});
