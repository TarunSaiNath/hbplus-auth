import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = { message: string; onDismiss?: () => void };

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  text: { flex: 1, color: "#B91C1C", fontSize: 14, lineHeight: 20 },
  close: { color: "#B91C1C", fontSize: 16, marginLeft: 12 },
});
