"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, initFirebaseAnalytics } from "@/lib/firebase/client";
import { ensureUserDoc } from "@/lib/firebase/data";

type AuthContextValue = { user: FirebaseUser | null; loading: boolean };

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void initFirebaseAnalytics();
    return onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        try {
          await ensureUserDoc(nextUser);
        } catch {
          // Profile sync is best-effort; auth state still resolves.
        }
      }
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
