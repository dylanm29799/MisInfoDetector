import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api";

const AuthContext = createContext(null);

function decodeEmail() {
  return localStorage.getItem("misinfo_email") || null;
}

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(decodeEmail());
  const [token, setTok] = useState(getToken());

  useEffect(() => {
    if (email) localStorage.setItem("misinfo_email", email);
    else localStorage.removeItem("misinfo_email");
  }, [email]);

  const value = useMemo(
    () => ({
      email,
      isAuthed: Boolean(token),
      async login(e, p) {
        const data = await api.login(e, p);
        setToken(data.access_token);
        setTok(data.access_token);
        setEmail(data.email);
      },
      async signup(e, p) {
        const data = await api.signup(e, p);
        setToken(data.access_token);
        setTok(data.access_token);
        setEmail(data.email);
      },
      logout() {
        setToken(null);
        setTok(null);
        setEmail(null);
      },
    }),
    [email, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
