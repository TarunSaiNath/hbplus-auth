import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { fetchAllUsers, UserProfile } from "../../src/services/userService";

export default function Dashboard() {
  const { user, role, signOutUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") return;
    setLoadingUsers(true);
    fetchAllUsers()
      .then(setUsers)
      .catch(() => setUsersError("Could not load users."))
      .finally(() => setLoadingUsers(false));
  }, [role]);

  const initial = (user?.displayName || user?.email || "?")[0].toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.card}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.displayName ?? "Welcome"}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View
          style={[
            styles.badge,
            role === "admin" ? styles.badgeAdmin : styles.badgeUser,
          ]}
        >
          <Text style={styles.badgeText}>
            {role === "admin" ? "ADMIN" : "USER"}
          </Text>
        </View>

        <Pressable style={styles.logout} onPress={signOutUser}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {role === "admin" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Admin panel: all users</Text>
          {loadingUsers && <ActivityIndicator color="#4F46E5" />}
          {usersError && <Text style={styles.err}>{usersError}</Text>}
          {users.map((u) => (
            <View key={u.uid} style={styles.row}>
              <Text style={styles.rowEmail}>{u.email}</Text>
              <Text style={styles.rowRole}>{u.role}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
    gap: 20,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarFallback: {
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700", color: "#111827" },
  email: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  badge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeAdmin: { backgroundColor: "#FEE2E2" },
  badgeUser: { backgroundColor: "#E0E7FF" },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  logout: {
    marginTop: 22,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "600" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  rowEmail: { color: "#374151", fontSize: 14, flex: 1 },
  rowRole: { color: "#6B7280", fontSize: 13 },
  err: { color: "#B91C1C" },
});
