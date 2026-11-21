import { Redirect, Slot } from "expo-router";
import React from "react";
import { useAuth } from "../../src/context/AuthContext";

export default function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  return <Slot />;
}
