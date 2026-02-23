
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { gameColors } from "@/styles/commonStyles";

export default function ProfileScreen() {
  // Placeholder - not needed for MVP
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: gameColors.background,
  },
  text: {
    color: gameColors.text,
    fontSize: 24,
  },
});
