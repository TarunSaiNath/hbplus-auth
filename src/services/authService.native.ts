import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { DOMAIN_ERROR_MESSAGE, isAllowedEmail } from "../utils/domainValidator";

export class DomainRestrictedError extends Error {
  constructor() {
    super(DOMAIN_ERROR_MESSAGE);
    this.name = "DomainRestrictedError";
  }
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  hostedDomain: process.env.EXPO_PUBLIC_ALLOWED_DOMAIN, // UI hint only, NOT security
});

export async function signInWithGoogle(): Promise<User> {
  try {
    await GoogleSignin.hasPlayServices();
    const res: any = await GoogleSignin.signIn();

    if (res?.type === "cancelled") throw new Error("Sign-in was cancelled.");
    const idToken = res?.data?.idToken ?? res?.idToken;
    if (!idToken) throw new Error("No ID token received from Google.");

    const credential = GoogleAuthProvider.credential(idToken);
    const { user } = await signInWithCredential(auth, credential);

    // Same guard as web
    if (!isAllowedEmail(user.email, user.emailVerified)) {
      await signOut(auth);
      await GoogleSignin.signOut();
      throw new DomainRestrictedError();
    }
    return user;
  } catch (e: any) {
    if (e instanceof DomainRestrictedError) throw e;
    if (e?.message === "Sign-in was cancelled.") throw e;
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED)
        throw new Error("Sign-in was cancelled.");
      if (e.code === statusCodes.IN_PROGRESS)
        throw new Error("Sign-in already in progress.");
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        throw new Error(
          "Google Play Services is not available on this device.",
        );
    }
    console.error("Native sign-in error:", e);
    throw new Error("Something went wrong while signing in. Please try again.");
  }
}

export const logOut = async () => {
  await signOut(auth);
  try {
    await GoogleSignin.signOut();
  } catch {} // so the account picker appears next time
};
