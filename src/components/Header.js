import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";

const Header = () => {
  const [fontsLoaded] = useFonts({
    "AbrilFatface-Regular": require("../../assets/fonts/AbrilFatface-Regular.ttf"),
  });


  return (
      <Text style={styles.text}>İzmir Eventy</Text>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontFamily: "AbrilFatface-Regular",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: Platform.OS === "ios" ? 40 : 30,
    backgroundColor: "#121212",
  },
});
