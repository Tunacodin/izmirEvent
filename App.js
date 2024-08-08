import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import EventList from "./src/EventList"; // Yolunu düzelttik
import EventDetail from "./src/EventDetail"; // Yolunu düzelttik
import Header from "./src/components/Header";

const Stack = createStackNavigator();

function App() {
  return (
    <Provider store={store}>
      <NavigationContainer
      //sayfa isimlerini gizle
      >
        <Header />
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="EventList"
        >
          <Stack.Screen name="EventList" component={EventList} />
          <Stack.Screen name="EventDetail" component={EventDetail} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
