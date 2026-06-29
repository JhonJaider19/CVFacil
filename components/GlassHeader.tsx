import { useAuth } from "@/src/lib/auth-context";
import { getAllSuggestionsForUser } from "@/src/lib/api";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";
import { MaterialIcons } from "@expo/vector-icons";

interface GlassHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export default function GlassHeader({ title = "CVFácil", children }: GlassHeaderProps) {
  const { signOut, profile, user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const avatarUri = profile?.avatar_url || user?.avatarUrl || null;
  const name = profile?.name ?? "";

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllSuggestionsForUser(),
    enabled: showNotifications,
  });

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
    <>
      <View className="absolute top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl" style={{ paddingTop: STATUS_BAR_HEIGHT }}>
        <View className="w-full max-w-6xl mx-auto px-6 flex-row items-center justify-between" style={{ height: 64 }}>
          <Text className="text-xl font-display tracking-tight text-primary">
            {title}
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable
              className="p-1 hover:bg-surface-container-low rounded-lg relative"
              onPress={() => setShowNotifications(true)}
            >
              <MaterialIcons name="notifications-none" size={24} color="#525f73" />
            </Pressable>
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
            <View className="w-8 h-8 rounded-full bg-secondary-container items-center justify-center overflow-hidden border border-outline-variant/15">
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} className="w-full h-full" />
              ) : (
                <Text className="text-xs font-body-bold text-secondary">
                  {name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            {children}
          </View>
        </View>
      </View>

      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setShowNotifications(false)}
        >
          <Pressable
            className="bg-surface rounded-3xl w-11/12 max-w-md max-h-[70%] overflow-hidden"
            onPress={() => {}}
          >
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="notifications" size={22} color="#0b55cf" />
                <Text className="font-headline text-xl text-on-surface">Notificaciones</Text>
              </View>
              <Pressable onPress={() => setShowNotifications(false)}>
                <MaterialIcons name="close" size={22} color="#525f73" />
              </Pressable>
            </View>

            <ScrollView className="px-6 py-4">
              {!notifications || notifications.length === 0 ? (
                <View className="items-center py-12">
                  <MaterialIcons name="notifications-off" size={40} color="#bac7de" />
                  <Text className="text-on-surface-variant font-body text-sm mt-4 text-center">
                    No tienes notificaciones nuevas
                  </Text>
                </View>
              ) : (
                notifications.map((n) => (
                  <View key={n.id} className="mb-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <View className="flex-row items-center gap-2 mb-2">
                      <MaterialIcons name="auto-awesome" size={14} color="#1a6c23" />
                      <Text className="text-[10px] font-body-bold text-tertiary uppercase tracking-wider">
                        {n.section}
                      </Text>
                    </View>
                    <Text className="text-on-surface font-body text-sm leading-relaxed">
                      {n.suggestion}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}