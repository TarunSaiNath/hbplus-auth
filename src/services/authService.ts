import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { Platform } from "react-native";
import { auth } from "../config/firebase";
import { DOMAIN_ERROR_MESSAGE, isAllowedEmail } from "../utils/domainValidator";

export class DomainRestrictedError extends Error {
  constructor() {
    super(DOMAIN_ERROR_MESSAGE);
    this.name = "DomainRestrictedError";
  }
}

export async function signInWithGoogle(): Promise<User> {
  if (Platform.OS !== "web") {
    // We add this in the mobile stage
    throw new Error("Mobile Google sign-in is not set up yet.");
  }

  const provider = new GoogleAuthProvider();
  // UI hint only: Google pre-selects work accounts. NOT security.
  provider.setCustomParameters({
    hd: process.env.EXPO_PUBLIC_ALLOWED_DOMAIN!,
    prompt: "select_account",
  });

  try {
    const { user } = await signInWithPopup(auth, provider);

    // The guard checks the visitor
    if (!isAllowedEmail(user.email, user.emailVerified)) {
      await signOut(auth); // take the pass back immediately
      throw new DomainRestrictedError();
    }
    return user;
  } catch (e: any) {
    if (e instanceof DomainRestrictedError) throw e;
    if (e?.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled.");
    }
    if (e?.code === "auth/popup-blocked") {
      throw new Error("Popup blocked. Please allow popups and try again.");
    }
    throw new Error("Something went wrong while signing in. Please try again.");
  }
}

export const logOut = () => signOut(auth);
