import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const expoClientID =
    "213208923098-p7pvcippk9cku4765im8obh05upirqdb.apps.googleusercontent.com";
  const androidClientID =
    "213208923098-mim9vkoq8f0qbbi93eticqva7cao2707.apps.googleusercontent.com";
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: expoClientID,
    androidClientId: androidClientID,
    selectAccount: true,
  });

  useEffect(() => {
    getData();
  }, []);

  const storeData = async (accessToken) => {
    try {
      const ts = JSON.stringify(new Date().getTime());
      await AsyncStorage.setItem("@googleAccessToken", accessToken);
      await AsyncStorage.setItem("@tokenTimestamp", ts);
      console.log("google access token saved in async local stroage");
    } catch (e) {
      console.log(e);
    }
  };

  const getData = async () => {
    try {
      const token = await AsyncStorage.getItem("@googleAccessToken");
      if (token !== null) {
        const ts = await AsyncStorage.getItem("@tokenTimestamp");
        if (ts !== null) {
          const now = new Date().getTime();
          const differenceMinutes = Math.floor(
            (((now - ts) / 1000) % 3600) / 60
          );
          if (differenceMinutes < 55) {
            console.log(
              "token is valid for " +
                (60 - differenceMinutes) +
                " minutes, using current token"
            );
            fetchUserInfo(token);
          } else {
            console.log("token is not valid, user must log in");
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      const {
        authentication: { accessToken },
      } = response;

      storeData(accessToken);

      setIsLoading(true);
      fetchUserInfo(accessToken);
    }
  }, [response]);

  useEffect(() => {
    if (userDetails) {
      const { name, email } = userDetails;
      setIsLoading(false);
      navigation.navigate("Homepage", {
        userName: name,
        userEmail: email,
        updatePlants: true,
      });
    }
  }, [userDetails]);

  async function fetchUserInfo(token) {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => setUserDetails(data))
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#4c924d" }}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4c924d" style="light" />
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={styles.headline}>Welcome to iVY</Text>
          <Text style={styles.title}>Your personal gardening assistant!</Text>
        </View>
      </SafeAreaView>
      <View
        style={{
          backgroundColor: "#fafce6",
          flex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          alignItems: "center",
        }}
      >
        <Text style={styles.text}>Please sign in with Google</Text>
        <Pressable
          style={styles.buttonContainer}
          onPress={() => {
            promptAsync();
          }}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
        {isLoading && (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
    marginBottom: 10,
    marginTop: 30,
  },
  headline: {
    color: "#fafce6",
    fontWeight: "bold",
    fontSize: 30,
    marginTop: 10,
  },
  title: {
    color: "#fafce6",
    fontSize: 18,
    marginTop: 10,
  },
  text: {
    color: "#4c924d",
    fontSize: 16,
    marginTop: 30,
  },
  buttonContainer: {
    width: 160,
    height: 50,
    backgroundColor: "#4c924d",
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
