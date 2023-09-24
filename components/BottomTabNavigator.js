import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from "react-native-vector-icons/Ionicons"; //Aula 70: Biblioteca dos ícones

import TransactionScreen from "../screens/Transaction";
import SearchScreen from "../screens/Search";

const Tab = createBottomTabNavigator();

export default class BottomTabNavigator extends Component {
  render() {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
          //Aula 70: Personalizando o navegador de abas: com cores e ícones
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: "#5653D4",
            tabBarInactiveTintColor: "black",
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Transação") {
                iconName = "book";
              } else if (route.name === "Pesquisa") {
                iconName = "search";
              }
              return (
                <Ionicons
                  name = {iconName}
                  size = {size}
                  color = {color}
                />
              );
            }
          })}
          >
            <Tab.Screen name="Transação" component={TransactionScreen} />
            <Tab.Screen name="Pesquisa" component={SearchScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}