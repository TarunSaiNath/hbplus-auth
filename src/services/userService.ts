import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export type Role = "admin" | "user";

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  photo: string;
  role: Role;
};

// Called after every successful login. Returns the user's role.
export async function syncUserProfile(user: User): Promise<Role> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      name: user.displayName ?? "",
      photo: user.photoURL ?? "",
      role: "user",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    return "user";
  }

  await updateDoc(ref, { lastLogin: serverTimestamp() });
  return snap.data().role === "admin" ? "admin" : "user";
}
// Admin only (the rules enforce this, not just the UI)
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), orderBy("lastLogin", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    uid: d.id,
    ...(d.data() as Omit<UserProfile, "uid">),
  }));
}
