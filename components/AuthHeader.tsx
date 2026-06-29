import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuthHeaderProps {
  children?: React.ReactNode;
  onBack?: () => void;
}

export default function AuthHeader({ children, onBack }: AuthHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="bg-surface/80">
      <View
        className="h-16 flex-row items-center justify-between px-6"
        style={{ backgroundColor: "rgba(248, 249, 250, 0.8)", backdropFilter: "blur(12px)" as any }}
      >
        <View className="flex-row items-center gap-3">
          {onBack && (
            <Pressable onPress={onBack}>
              <Text className="text-primary text-2xl">←</Text>
            </Pressable>
          )}
          <View className="w-8 h-8 bg-primary rounded-lg items-center justify-center">
            <Text className="text-on-primary text-sm font-bold">CV</Text>
          </View>
          <Text className="text-xl font-extrabold tracking-tight text-primary font-headline">
            CVFácil
          </Text>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}