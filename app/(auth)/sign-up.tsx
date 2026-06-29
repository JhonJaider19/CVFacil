import { useAuth } from "@/src/lib/auth-context";
import { router } from "expo-router";
import { useState } from "react";
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

export default function SignUpScreen() {
  const { signUp, signInWithOAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  async function handleSignUp() {
    if (!name.trim()) {
      setError("Ingresa tu nombre completo");
      return;
    }
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, name.trim());
      if (result.requireEmailVerification) {
        router.replace(
          `/(auth)/verify?email=${encodeURIComponent(email.trim())}` as any,
        );
      } else {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    setError("");
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
      <AuthHeader onBack={() => router.back()}>
        <Pressable onPress={() => router.push("/(auth)/sign-in" as any)}>
          <Text className="text-primary font-bold text-sm">
            Log in
          </Text>
        </Pressable>
      </AuthHeader>

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
          <View className="flex-1 items-center justify-center pt-12 pb-12 px-4 relative">
            <View className="w-full max-w-md z-10">
            {/* Header */}
            <View className="mb-10">
              <Text className="font-headline text-3xl font-extrabold tracking-tight text-on-surface text-center mb-2">
                CREA TU CUENTA
              </Text>
              <Text className="text-on-surface-variant font-body text-center opacity-80">
                Comienza a construir tu futuro profesional hoy mismo.
              </Text>
            </View>

            {error ? (
              <View className="bg-error-container p-4 rounded-xl mb-6">
                <Text className="text-on-error-container font-body text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Registration Card */}
            <View className="bg-surface-container-lowest rounded-xl p-8"
              style={{ shadowColor: "#191c1d", shadowOffset: { width: 0, height: 32 }, shadowOpacity: 0.06, shadowRadius: 64, elevation: 8, borderColor: "rgba(193, 198, 214, 0.1)", borderWidth: 1 }}
            >
              {/* Social Auth */}
              <View className="gap-4 mb-8">
                <Pressable
                  className="h-14 flex-row items-center justify-center gap-3 bg-surface-container-lowest rounded-xl"
                  style={{ borderWidth: 1, borderColor: "rgba(193, 198, 214, 0.3)" }}
                  disabled={!!oauthLoading}
                  onPress={() => handleOAuth("google")}
                >
                  {oauthLoading === "google" ? (
                    <ActivityIndicator size="small" color="#0b55cf" />
                  ) : (
                    <Text className="text-lg font-bold text-blue-500">G</Text>
                  )}
                  <Text className="font-label text-sm font-semibold text-on-surface">
                    Registrarse con Google
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
                    <Text className="text-lg text-inverse-on-surface font-bold">&lt;/&gt;</Text>
                  )}
                  <Text className="font-label text-sm font-semibold text-inverse-on-surface">
                    Registrarse con GitHub
                  </Text>
                </Pressable>
              </View>

              {/* Separator */}
              <View className="flex-row items-center gap-4 mb-8">
                <View className="flex-1 h-px bg-outline-variant/20" />
                <Text className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  O REGÍSTRATE CON TU CORREO
                </Text>
                <View className="flex-1 h-px bg-outline-variant/20" />
              </View>

              {/* Form */}
              <View className="gap-8">
                <View className="gap-6">
                  <View className="gap-1">
                    <Text className="font-label text-xs font-semibold text-outline-variant ml-1">
                      Nombre Completo
                    </Text>
                    <TextInput
                      className="text-on-surface font-body py-3 px-1"
                      placeholder="John Doe"
                      placeholderTextColor="rgba(114, 119, 133, 0.5)"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      style={{ borderBottomWidth: 1, borderBottomColor: "rgba(193, 198, 214, 0.4)" }}
                    />
                  </View>
                  <View className="gap-1">
                    <Text className="font-label text-xs font-semibold text-outline-variant ml-1">
                      Correo Electrónico
                    </Text>
                    <TextInput
                      className="text-on-surface font-body py-3 px-1"
                      placeholder="email@ejemplo.com"
                      placeholderTextColor="rgba(114, 119, 133, 0.5)"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={{ borderBottomWidth: 1, borderBottomColor: "rgba(193, 198, 214, 0.4)" }}
                    />
                  </View>
                  <View className="gap-1 relative">
                    <Text className="font-label text-xs font-semibold text-outline-variant ml-1">
                      Contraseña
                    </Text>
                    <View className="flex-row items-center">
                      <TextInput
                        className="flex-1 text-on-surface font-body py-3 px-1"
                        placeholder="••••••••"
                        placeholderTextColor="rgba(114, 119, 133, 0.5)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        style={{ borderBottomWidth: 1, borderBottomColor: "rgba(193, 198, 214, 0.4)" }}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-2 bottom-3"
                      >
                        <Text className="text-outline-variant text-lg">
                          {showPassword ? "🙈" : "👁️"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* CTA */}
                <Pressable
                  className="h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2"
                  style={{ shadowColor: "#0b55cf", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }}
                  disabled={loading}
                  onPress={handleSignUp}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text className="text-on-primary font-headline font-bold">
                        Crear Cuenta
                      </Text>
                      <Text className="text-on-primary">→</Text>
                    </>
                  )}
                </Pressable>
              </View>

              {/* Footer link */}
              <View className="mt-8">
                <Text className="font-body text-sm text-on-surface-variant text-center">
                  ¿Ya tienes una cuenta?{" "}
                  <Text
                    className="text-primary font-bold"
                    onPress={() => router.push("/(auth)/sign-in" as any)}
                  >
                    Iniciar Sesión
                  </Text>
                </Text>
              </View>
            </View>

            {/* Terms notice */}
            <Text className="mt-8 text-[11px] text-center text-outline-variant leading-relaxed px-6">
              Al registrarte, aceptas nuestros{" "}
              <Text className="underline">Términos de Servicio</Text> y{" "}
              <Text className="underline">Política de Privacidad</Text>.
              Tu seguridad es nuestra prioridad.
            </Text>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
