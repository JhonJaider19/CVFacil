import { useAuth } from "@/src/lib/auth-context";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { insforge } from "@/src/lib/insforge";

const OAUTH_VERIFIER_FILE = `${FileSystem.cacheDirectory ?? ""}cvfacil-oauth-verifier.json`;

export default function OAuthCallbackScreen() {
  const params = useLocalSearchParams<{
    insforge_code?: string;
    insforge_status?: string;
    insforge_error?: string;
  }>();
  const { signOut } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    (async () => {
      const errorMessage = params.insforge_error;
      const status = params.insforge_status;
      const code = params.insforge_code;

      // Guard: if a session is already active, the code may have been
      // exchanged elsewhere (e.g. by signInWithOAuth) or the deep link
      // arrived after the user was already authenticated. Navigate to
      // tabs without re-exchanging the code.
      try {
        const { data: currentUserData } = await insforge.auth.getCurrentUser();
        if (currentUserData?.user) {
          router.replace("/(tabs)" as any);
          return;
        }
      } catch {
        // fall through to normal exchange path
      }

      if (status === "error" || errorMessage) {
        router.replace(
          `/(auth)/sign-in?error=${encodeURIComponent(errorMessage || "Error en autenticación OAuth")}` as any,
        );
        return;
      }

      if (!code) {
        router.replace("/(auth)/sign-in?error=No se recibió código de autenticación" as any);
        return;
      }

      let codeVerifier: string | undefined;
      try {
        const raw = await FileSystem.readAsStringAsync(OAUTH_VERIFIER_FILE);
        const parsed = JSON.parse(raw) as { codeVerifier?: string };
        codeVerifier = parsed.codeVerifier;
      } catch {
        // verifier file missing; try generic exchange without it
      }

      try {
        await FileSystem.deleteAsync(OAUTH_VERIFIER_FILE, { idempotent: true });
      } catch {
        // ignore
      }

      if (!codeVerifier) {
        router.replace(
          "/(auth)/sign-in?error=Sesión OAuth expirada, intenta de nuevo" as any,
        );
        return;
      }

      const { error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);
      if (error) {
        await signOut().catch(() => {});
        router.replace(
          `/(auth)/sign-in?error=${encodeURIComponent(error.message)}` as any,
        );
        return;
      }

      router.replace("/(tabs)" as any);
    })();
  }, [params.insforge_code, params.insforge_error, params.insforge_status, signOut]);

  return (
    <View className="flex-1 bg-surface items-center justify-center gap-4">
      <ActivityIndicator size="large" color="#0b55cf" />
      <Text className="text-on-surface-variant font-body">
        Completando inicio de sesión...
      </Text>
    </View>
  );
}
