import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = { onPress: () => void; loading?: boolean };

export default function GoogleButton({ onPress, loading = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Login with Google"
    >
      {loading ? (
        <ActivityIndicator color="#374151" />
      ) : (
        <>
          <View style={styles.logo}>
            <Text style={styles.logoText}>G</Text>
          </View>
          <Text style={styles.label}>Login with Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  pressed: { backgroundColor: "#F9FAFB" },
  disabled: { opacity: 0.7 },
  logo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  label: { fontSize: 15, fontWeight: "600", color: "#374151" },
});
