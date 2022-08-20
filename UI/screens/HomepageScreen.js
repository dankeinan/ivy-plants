import React, { useState, useEffect, useRef } from "react";
import { useRoute } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import PlantCard from "../components/PlantCard";
import Header from "../components/Header";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function requestPermissionsAsync() {
  await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
}

async function schedulePushNotification(status, name) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Message from iVY",
      body: name + " is too " + status,
      data: { data: "test" },
    },
    trigger: { seconds: 1 },
  });
}

export default function HomepageScreen() {
  const route = useRoute();
  userID = route.params.userEmail;
  const navigation = useNavigation();
  const [loadPlants, setLoadPlants] = useState(false);
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();

  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const addButtonPressed = () => {
    navigation.navigate("AddNewPlant", {
      userName: route.params.userName,
      userEmail: route.params.userEmail,
    });
  };

  const logoutUser = () => {
    AsyncStorage.removeItem("@googleAccessToken");
    AsyncStorage.removeItem("@tokenTimestamp");
    AuthSession.dismiss();
    navigation.navigate("Welcome", {
      userName: route.params.userName,
      userEmail: route.params.userEmail,
    });
  };

  function onNewMessage(param) {
    var messageArray = param.split(":");
    if (messageArray[0] == "1") {
      schedulePushNotification("wet", messageArray[2]);
    }
    if (messageArray[0] == "-1") {
      schedulePushNotification("dry", messageArray[2]);
    }
  }

  //set websocket connection once when homepage is mounted for push notifications
  useEffect(() => {
    const signalR = require("@microsoft/signalr");
    const apiBaseUrl = "https://functionapp220220419172755.azurewebsites.net";
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(apiBaseUrl + "/api")
      .build();
    connection.on(route.params.userEmail, onNewMessage);
    connection.start();

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#fafce6",
      });
    }
  }, []);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    requestPermissionsAsync();

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function postAuthentication() {
    setIsLoading(true);
    const response = await fetch(
      "https://functionapp220220419172755.azurewebsites.net/api/homepage?",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: route.params.userEmail,
          name: route.params.userName,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        setPlants(JSON.parse(data));
      })
      .catch((err) => {
        console.log(err);
      });
    setIsLoading(false);
    setLoadPlants(false);
  }

  useEffect(() => {
    if (loadPlants) {
      postAuthentication();
    }
    return () => setLoadPlants(false);
  }, [loadPlants]);

  useEffect(() => {
    if (isFocused) {
      if (route.params.updatePlants) {
        setLoadPlants(true);
      }
    }
  }, [isFocused]);

  return (
    <View style={{ flex: 1, backgroundColor: "#4c924d" }}>
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.logoutButton}
          onPress={logoutUser}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <SafeAreaView style={styles.container}>
        <Header userName={route.params.userName} />
      </SafeAreaView>
      <View
        style={{
          backgroundColor: "#fafce6",
          flex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 10,
        }}
      >
        <View style={{ marginLeft: 20, marginTop: 20, marginBottom: 10 }}>
          <Text style={styles.title}>Manage Your Plants</Text>
        </View>
        <ScrollView scrollEventThrottle={16}>
          <View style={{ flex: 1, marginLeft: 20, marginRight: 20 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {plants.map((plant, i) => {
                return (
                  <PlantCard
                    key={i}
                    userName={route.params.userName}
                    userEmail={route.params.userEmail}
                    plantImage={plant.imageUrl}
                    plantName={plant.plantName}
                    species={plant.species}
                    optimalMoisture={plant.moisture}
                    currentMoisture={plant.lastSample}
                    plantID={plant.plantID}
                    plants={plants}
                    setPlants={setPlants}
                  />
                );
              })}
            </ScrollView>
          </View>
          {isLoading && <ActivityIndicator size="large" />}
        </ScrollView>
      </View>
      <View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.addButton}
          onPress={addButtonPressed}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
  },
  headline: {
    color: "#4c924d",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 5,
  },
  title: {
    color: "#4c924d",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
  },
  text: {
    color: "#215221",
    fontSize: 14,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  addButton: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 35,
    bottom: 35,
    backgroundColor: "#4c924d",
    borderRadius: 100,
    shadowColor: "black",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  buttonText: {
    color: "#fafce6",
    fontSize: 35,
  },
  logoutButton: {
    alignItems: "left",
    justifyContent: "center",
    marginLeft: 25,
    marginTop: 40,
    marginBottom: 20,
  },
  logoutText: {
    color: "#fafce6",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
