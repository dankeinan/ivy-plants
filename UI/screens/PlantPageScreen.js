import React from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import { useNavigation, useRoute, useState } from "@react-navigation/native";
import Header from "../components/Header";
import { BarChart } from "react-native-chart-kit";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  Alert,
} from "react-native";

export default function PlantPageScreen() {
  const route = useRoute();
  const navigate1 = useNavigation();
  const screenWidth = Dimensions.get("window").width;
  const [isLoading, setIsLoading] = React.useState(false);
  const data = {
    labels: ["Optimal", "Last sampled"],
    datasets: [
      {
        data: [
          route.params.optimalMoisture / 10,
          route.params.currentMoisture / 10,
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fafce6",
    backgroundGradientTo: "#fafce6",
    color: (opacity = 1) => `rgba(76, 146, 77, ${opacity})`,
  };

  async function deletePlant() {
    setIsLoading(true);
    let id = route.params.plantID;
    const response = await fetch(
      "https://functionapp220220419172755.azurewebsites.net/api/deleteplant?plantID=" +
        id,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    ).then((response) => {
      setIsLoading(false);
      if (response.status === 200) {
        Alert.alert("Delete", "Plant deleted successfully!", [
          {
            text: "OK",
            onPress: () =>
              navigate1.navigate("Homepage", {
                userName: route.params.userName,
                userEmail: route.params.userEmail,
                updatePlants: true,
              }),
          },
        ]);
      } else {
        Alert.alert("Delete", "There was a problem deleting your plant", [
          {
            text: "OK",
            onPress: () => console.log("Deletion failed."),
          },
        ]);
      }
    });
  }

  const deletePlantPressed = () =>
    Alert.alert(
      "Delete plant",
      "The deletion is permanent.\nAre you sure you want to delete this plant?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel deletion pressed"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: deletePlant,
        },
      ]
    );

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
        <View
          style={{ flex: 0.25, flexDirection: "row", alignItems: "center" }}
        >
          <View style={{ marginLeft: 20, justifyContent: "center" }}>
            <Image
              source={{
                uri: route.params.plantImage,
              }}
              style={{ width: 100, height: 100, borderRadius: 15 }}
            />
          </View>
          <View style={{ marginLeft: 20, justifyContent: "center" }}>
            <Text style={styles.title}>{route.params.plantName}</Text>
            <Text style={styles.text}>{route.params.species}</Text>
          </View>
        </View>
        <View
          style={{
            flex: 0.5,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 30,
          }}
        >
          <BarChart
            style={{
              marginVertical: 8,
            }}
            data={data}
            width={screenWidth - 40}
            height={screenWidth - 40}
            yAxisLabel="%"
            chartConfig={chartConfig}
          />
        </View>
        {isLoading && (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        )}
        <View
          style={{ flex: 0.25, alignItems: "center", justifyContent: "center" }}
        >
          <Pressable
            style={styles.buttonContainer}
            onPress={deletePlantPressed}
          >
            <Text style={styles.buttonText}>Delete plant</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    color: "#4c924d",
    fontSize: 18,
    marginTop: 5,
  },
  text: {
    color: "#4c924d",
    fontSize: 14,
    marginTop: 10,
  },
  plantImage: {
    flex: 1,
    width: null,
    height: null,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: "cover",
  },
  buttonContainer: {
    width: 160,
    height: 50,
    backgroundColor: "#B91111",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: "#fafce6",
    padding: 10,
  },
});
