import { useAuth } from "@/src/lib/auth-context";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

interface GlassHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export default function GlassHeader({ title = "CVFácil", children }: GlassHeaderProps) {
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch {
      Alert.alert("Error", "No se pudo cerrar la sesión");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <View className="absolute top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl">
      <View className="flex-row items-center justify-between px-6 h-16">
        <Text className="text-xl font-display tracking-tight text-primary">
          {title}
        </Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            className="px-3 py-1.5 rounded-lg bg-error-container/40 active:opacity-70"
            disabled={loggingOut}
            onPress={handleLogout}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#93000a" />
            ) : (
              <Text className="text-on-error-container text-xs font-body-bold">Salir</Text>
            )}
          </Pressable>
          {children}
        </View>
      </View>
    </View>
  );
}
