import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { insforge } from "./insforge";
import type { Profile } from "./types";

const OAUTH_VERIFIER_FILE = `${FileSystem.cacheDirectory ?? ""}cvfacil-oauth-verifier.json`;

interface AuthUser {
  id: string;
  email: string;
  avatarUrl: string | null;
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
      const avatarUrl: string | null = data.user.profile?.avatar_url ?? null;
      return { id: data.user.id, email: data.user.email ?? "", avatarUrl };
    },
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    await queryClient.fetchQuery({
      queryKey: ["auth", "user"],
      queryFn: async () => {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (error || !data?.user) return null;
        const avatarUrl: string | null = data.user.profile?.avatar_url ?? null;
        return { id: data.user.id, email: data.user.email ?? "", avatarUrl };
      },
    });
  }, [queryClient]);

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

  const syncAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!user) return;
      await insforge.auth.setProfile({ avatar_url: avatarUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  useEffect(() => {
    if (user?.avatarUrl && profile && !profile.avatar_url) {
      syncAvatarMutation.mutate(user.avatarUrl);
    }
  }, [user?.avatarUrl, profile?.avatar_url]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      await refreshUser();
    },
    [refreshUser],
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
        await refreshUser();
      }
      return { requireEmailVerification: !!data?.requireEmailVerification };
    },
    [refreshUser],
  );

  const signInWithOAuth = useCallback(
    async (provider: string) => {
      const redirectTo = Platform.select({
        web: window.location.origin,
        default: makeRedirectUri({
          scheme: "cvfacil",
          path: "oauth-callback",
        }),
      });

      const { data, error } = await insforge.auth.signInWithOAuth({
        provider,
        redirectTo,
        skipBrowserRedirect: Platform.OS !== "web",
      });

      if (error) throw new Error(error.message);

      if (Platform.OS === "web" || !data?.url) {
        await refreshUser();
        return;
      }

      if (data.codeVerifier) {
        try {
          await FileSystem.writeAsStringAsync(
            OAUTH_VERIFIER_FILE,
            JSON.stringify({
              codeVerifier: data.codeVerifier,
              provider,
              createdAt: Date.now(),
            }),
          );
        } catch {
          // Non-fatal: oauth-callback will handle missing verifier gracefully.
        }
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type !== "success") {
        try {
          await FileSystem.deleteAsync(OAUTH_VERIFIER_FILE, { idempotent: true });
        } catch {
          // ignore
        }
        throw new Error("Autenticación cancelada");
      }

      // The deep link to /oauth-callback will handle the code exchange
      // and navigate to /(tabs). We deliberately do NOT extract the code
      // here to avoid a double-exchange (which would invalidate the code).
    },
    [refreshUser],
  );

  const verifyEmail = useCallback(
    async (email: string, otp: string) => {
      const { data, error } = await insforge.auth.verifyEmail({ email, otp });
      if (error) throw new Error(error.message);
      await refreshUser();
    },
    [refreshUser],
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
    queryClient.removeQueries({ queryKey: ["auth", "user"] });
    queryClient.removeQueries({ queryKey: ["profile"] });
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
