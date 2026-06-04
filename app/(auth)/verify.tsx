import GradientButton from "@/components/GradientButton";
import { useAuth } from "@/src/lib/auth-context";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyScreen() {
  const { verifyEmail, resendOtp } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify() {
    if (otp.length < 6) {
      setError("Ingresa el código de 6 dígitos");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verifyEmail(email!, otp);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await resendOtp(email!);
      setError("Código reenviado");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={["top"]} className="bg-surface/80">
        <View
          className="h-16 flex-row items-center px-6"
          style={{ backgroundColor: "rgba(248, 249, 250, 0.8)", backdropFilter: "blur(12px)" as any }}
        >
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-primary rounded-lg items-center justify-center">
              <Text className="text-on-primary text-sm font-bold">CV</Text>
            </View>
            <Text className="text-xl font-extrabold tracking-tight text-primary font-headline">
              CVFácil
            </Text>
          </View>
        </View>
      </SafeAreaView>

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
          <View className="flex-1 items-center justify-center px-6 pt-12 pb-12">
            <View className="w-full max-w-[480px] gap-10">
            {/* Header */}
            <View className="gap-2">
              <Text className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
                VERIFICA TU EMAIL
              </Text>
              <Text className="text-on-surface-variant font-body">
                Hemos enviado un código de 6 dígitos a{" "}
                <Text className="font-bold text-on-surface">{email}</Text>
              </Text>
            </View>

            {error ? (
              <View className="bg-error-container p-4 rounded-xl">
                <Text className="text-on-error-container font-body text-sm">{error}</Text>
              </View>
            ) : null}

            {/* OTP Input */}
            <View className="gap-2">
              <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                Código de verificación
              </Text>
              <TextInput
                className="text-3xl text-center text-on-surface font-headline tracking-[12px] py-4"
                placeholder="000000"
                placeholderTextColor="rgba(114, 119, 133, 0.4)"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                style={{ borderBottomWidth: 2, borderBottomColor: "rgba(193, 198, 214, 0.4)" }}
              />
            </View>

            <GradientButton
              className="w-full"
              disabled={loading}
              onPress={handleVerify}
            >
              {loading ? "Verificando..." : "Verificar código →"}
            </GradientButton>

            {/* Resend */}
            <Text className="text-center text-on-surface-variant font-body text-sm">
              ¿No recibiste el código?{" "}
              <Pressable onPress={handleResend} disabled={resending}>
                <Text className="text-primary font-bold">{resending ? "Enviando..." : "Reenviar"}</Text>
              </Pressable>
            </Text>

            {/* Back to login */}
            <Pressable
              className="flex-row justify-center"
              onPress={() => router.push("/(auth)/sign-in" as any)}
            >
              <Text className="text-primary font-bold font-headline">
                ← Volver a iniciar sesión
              </Text>
            </Pressable>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
