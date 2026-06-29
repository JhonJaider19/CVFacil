import { useAuth } from "@/src/lib/auth-context";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AuthHeader from "@/components/AuthHeader";

const EMAIL_NOT_VERIFIED_PATTERN =
  /email.*(not\s+)?verified|verify\s+your\s+email|unverified|correo.*(no\s+)?verific|verifica.*correo/i;

export default function SignInScreen() {
  const { signIn, signInWithOAuth, resetPassword, resendOtp } = useAuth();
  const params = useLocalSearchParams<{ error?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (params.error) {
      setError(params.error);
    }
  }, [params.error]);

  async function handleSignIn() {
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico");
      setNeedsVerification(false);
      return;
    }
    if (!password) {
      setError("Ingresa tu contraseña");
      setNeedsVerification(false);
      return;
    }
    setError("");
    setNeedsVerification(false);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg = e?.message ?? "";
      setError(msg);
      setNeedsVerification(EMAIL_NOT_VERIFIED_PATTERN.test(msg));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email.trim()) {
      setError("Ingresa tu correo primero");
      return;
    }
    setResending(true);
    try {
      await resendOtp(email.trim());
      setError("Te reenviamos el código de verificación. Revisa tu bandeja.");
      setNeedsVerification(false);
      router.replace(
        `/(auth)/verify?email=${encodeURIComponent(email.trim())}` as any,
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setResending(false);
    }
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      setError("Ingresa tu correo primero");
      return;
    }
    setError("");
    setNeedsVerification(false);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setError("Revisa tu correo para restablecer la contraseña");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    setError("");
    setNeedsVerification(false);
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider);
      // Navigation is handled by app/oauth-callback.tsx after the
      // code exchange completes. Do not navigate here.
    } catch (e: any) {
      setError(e.message);
    } finally {
      setOauthLoading(null);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <AuthHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Background blur decoration */}
          <View className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full pointer-events-none"
            style={{ transform: [{ scale: 3 }], position: "absolute", bottom: -80, left: -80 }}
          />

          <View className="flex-1 items-center justify-center px-6 pt-12 pb-12">
            <View className="w-full max-w-[480px] gap-10">
            {/* Welcome Header */}
            <View className="gap-2">
              <Text className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
                BIENVENIDO
              </Text>
              <Text className="text-on-surface-variant font-body">
                Crea el siguiente capítulo de tu carrera profesional.
              </Text>
            </View>

            {error ? (
              <View className="bg-error-container p-4 rounded-xl gap-3">
                <Text className="text-on-error-container font-body text-sm">{error}</Text>
                {needsVerification && (
                  <Pressable
                    onPress={handleResendVerification}
                    disabled={resending}
                    className="self-start bg-primary px-4 py-2 rounded-lg active:opacity-80"
                  >
                    {resending ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-on-primary font-body-bold text-sm">
                        Reenviar código de verificación
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            ) : null}

            {/* Social Login */}
            <View className="gap-4">
              <Pressable
                className="h-14 flex-row items-center justify-center gap-3 bg-surface-container-lowest rounded-xl"
                style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1 }}
                disabled={!!oauthLoading}
                onPress={() => handleOAuth("google")}
              >
                {oauthLoading === "google" ? (
                  <ActivityIndicator size="small" color="#0b55cf" />
                ) : (
                  <Text className="text-lg font-bold text-blue-500">G</Text>
                )}
                <Text className="font-headline font-semibold text-on-surface">
                  Google
                </Text>
              </Pressable>

              <Pressable
                className="h-14 flex-row items-center justify-center gap-3 bg-inverse-surface rounded-xl"
                disabled={!!oauthLoading}
                onPress={() => handleOAuth("github")}
              >
                {oauthLoading === "github" ? (
                  <ActivityIndicator size="small" color="#f0f1f2" />
                ) : (
                  <Text className="text-lg text-inverse-on-surface font-bold">⌘</Text>
                )}
                <Text className="font-headline font-semibold text-inverse-on-surface">
                  GitHub
                </Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-4">
              <View className="flex-1 h-px bg-outline-variant/20" />
              <Text className="text-xs font-bold text-outline uppercase tracking-widest font-headline">
                o con correo
              </Text>
              <View className="flex-1 h-px bg-outline-variant/20" />
            </View>

            {/* Form */}
            <View className="gap-8">
              <View className="gap-6">
                <View className="gap-2">
                  <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                    Correo electrónico
                  </Text>
                  <TextInput
                    className="text-on-surface font-body bg-transparent py-3"
                    placeholder="nombre@ejemplo.com"
                    placeholderTextColor="#72778566"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{ borderBottomWidth: 1, borderBottomColor: "rgba(193, 198, 214, 0.4)" }}
                  />
                </View>
                <View className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                      Contraseña
                    </Text>
                    <Pressable onPress={handleResetPassword}>
                      <Text className="text-xs font-semibold text-primary">
                        ¿Olvidé mi contraseña?
                      </Text>
                    </Pressable>
                  </View>
                  <TextInput
                    className="text-on-surface font-body bg-transparent py-3"
                    placeholder="••••••••"
                    placeholderTextColor="#72778566"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={{ borderBottomWidth: 1, borderBottomColor: "rgba(193, 198, 214, 0.4)" }}
                  />
                </View>
              </View>

              <Pressable
                className="h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2"
                style={{ shadowColor: "#0b55cf", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }}
                disabled={loading}
                onPress={handleSignIn}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-on-primary font-headline font-bold">
                      Iniciar Sesión
                    </Text>
                    <Text className="text-on-primary text-lg">→</Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* AI Pulse */}
            <View className="p-6 rounded-2xl bg-surface-container-low overflow-hidden">
              <View className="flex-row gap-4">
                <View className="w-10 h-10 rounded-full bg-tertiary-fixed items-center justify-center">
                  <Text className="text-on-tertiary-fixed text-lg">✨</Text>
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-sm font-bold text-on-surface font-headline">
                    Consejo de Carrera
                  </Text>
                  <Text className="text-xs text-on-surface-variant font-body leading-relaxed">
                    ¿Sabías que los CVs actualizados tienen un 40% más de probabilidad de ser vistos por reclutadores este mes?
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center">
              <Text className="text-on-surface-variant font-body">
                ¿No tienes cuenta?{" "}
              </Text>
              <Pressable onPress={() => router.push("/(auth)/sign-up" as any)}>
                <Text className="text-primary font-bold font-headline">
                  Regístrate
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
