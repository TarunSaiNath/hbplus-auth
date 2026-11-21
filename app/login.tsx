import { Redirect } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ErrorBanner from "../src/components/ErrorBanner";
import GoogleButton from "../src/components/GoogleButton";
import { useAuth } from "../src/context/AuthContext";

export default function LoginScreen() {
  const { user, signIn, signingIn, error, clearError } = useAuth();

  // Already logged in? No reason to see the login page.
  if (user) return <Redirect href="/dashboard" />;

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>HB+</Text>
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in with your official company Google account to continue.
        </Text>

        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        <GoogleButton onPress={signIn} loading={signingIn} />

        <Text style={styles.footer}>
          Only @{process.env.EXPO_PUBLIC_ALLOWED_DOMAIN} accounts are allowed.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  logoText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  footer: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 20,
  },
});
