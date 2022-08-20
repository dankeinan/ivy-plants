import "react-native-gesture-handler";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

// Screens
import WelcomeScreen from "./screens/WelcomeScreen";
import HomepageScreen from "./screens/HomepageScreen";
import PlantPageScreen from "./screens/PlantPageScreen"
import AddNewPlantScreen from "./screens/AddNewPlantScreen";

//React Navigation Setup
import { NavigationContainer } from "@react-navigation/native";

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Homepage" component={HomepageScreen} options={{headerShown: false}}/>
        <Stack.Screen name="PlantPage" component={PlantPageScreen} options={{headerShown: false}}/>
        <Stack.Screen name="AddNewPlant" component={AddNewPlantScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};