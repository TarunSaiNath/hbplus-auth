import { onAuthStateChanged, User } from "firebase/auth";
import { Role, syncUserProfile } from "../services/userService";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth } from "../config/firebase";
import { logOut, signInWithGoogle } from "../services/authService";
import { DOMAIN_ERROR_MESSAGE, isAllowedEmail } from "../utils/domainValidator";

type AuthContextType = {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signingIn: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && !isAllowedEmail(fbUser.email, fbUser.emailVerified)) {
        await logOut();
        setUser(null);
        setRole(null);
        setError(DOMAIN_ERROR_MESSAGE);
      } else if (fbUser) {
        try {
          setRole(await syncUserProfile(fbUser)); // load role BEFORE showing the app
        } catch (e) {
          console.error("Profile sync failed", e);
          setRole("user"); // fail safe: lowest privilege
        }
        setUser(fbUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await logOut();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      signingIn,
      error,
      signIn,
      signOutUser,
      clearError,
    }),
    [user, loading, signingIn, error, signIn, signOutUser, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
