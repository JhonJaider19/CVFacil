import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import { insforge } from "./insforge";
import type { Profile } from "./types";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ requireEmailVerification: boolean }>;
  signInWithOAuth: (provider: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) return null;
      return { id: data.user.id, email: data.user.email ?? "" };
    },
    retry: false,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) return null;
      return data as Profile;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user && !profile) {
      insforge.database
        .from("profiles")
        .insert([
          {
            id: user.id,
            name: user.email.split("@")[0],
          },
        ])
        .then(({ error }) => {
          if (!error) {
            queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          }
        });
    }
  }, [user, profile, queryClient]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    [queryClient],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name,
      });
      if (error) throw new Error(error.message);
      if (data?.accessToken) {
        queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      }
      return { requireEmailVerification: !!data?.requireEmailVerification };
    },
    [queryClient],
  );

  const signInWithOAuth = useCallback(
    async (provider: string) => {
      const redirectTo = Platform.select({
        web: window.location.origin,
        default: makeRedirectUri({ scheme: "cvfacil", path: "oauth-callback" }),
      });

      const { data, error } = await insforge.auth.signInWithOAuth({
        provider,
        redirectTo,
        skipBrowserRedirect: Platform.OS !== "web",
      });

      if (error) throw new Error(error.message);

      if (Platform.OS === "web" || !data?.url) {
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type !== "success") {
        throw new Error("Autenticación cancelada");
      }

      const returnUrl = result.url;
      const code = new URL(returnUrl).searchParams.get("insforge_code");

      if (!code) {
        const status = new URL(returnUrl).searchParams.get("insforge_status");
        if (status === "error") {
          const msg = new URL(returnUrl).searchParams.get("insforge_error");
          throw new Error(msg || "Error en autenticación OAuth");
        }
        throw new Error("No se recibió código de autenticación");
      }

      const { error: exchangeError } = await insforge.auth.exchangeOAuthCode(
        code,
        data.codeVerifier,
      );
      if (exchangeError) throw new Error(exchangeError.message);

      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    [queryClient],
  );

  const verifyEmail = useCallback(
    async (email: string, otp: string) => {
      const { data, error } = await insforge.auth.verifyEmail({ email, otp });
      if (error) throw new Error(error.message);
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    [queryClient],
  );

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await insforge.auth.sendResetPasswordEmail({ email });
    if (error) throw new Error(error.message);
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    const { data, error } = await insforge.auth.resendVerificationEmail({ email });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await insforge.auth.signOut();
    queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        profile: profile ?? null,
        loading: userLoading,
        signIn,
        signUp,
        signInWithOAuth,
        verifyEmail,
        resetPassword,
        resendOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
