import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="font-headline text-2xl text-on-surface">
          Página no encontrada
        </Text>
        <Link href="/" className="mt-4">
          <Text className="text-primary">Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}
