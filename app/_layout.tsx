import { Slot } from "expo-router";
import React from "react";
import Loader from "../src/components/Loader";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function Gate() {
  const { loading } = useAuth();
  // Still checking for an existing session? Don't decide anything yet.
  if (loading) return <Loader />;
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
