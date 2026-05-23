import { Pressable, Text, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

const tabIcons: Record<string, { icon: string; label: string }> = {
  index: { icon: "dashboard", label: "Inicio" },
  editor: { icon: "description", label: "Mis CVs" },
  templates: { icon: "style", label: "Plantillas" },
  assistant: { icon: "chat-bubble", label: "Entrevista" },
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="flex-row items-center justify-around bg-surface pb-6 pt-3 px-4 border-t border-outline-variant/10">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, { merge: true });
          }
        };

        const tabConfig = tabIcons[route.name] ?? {
          icon: "star",
          label: options.title ?? route.name,
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className="items-center justify-center gap-1.5"
            style={{ minWidth: 60 }}
          >
            <View
              className={`items-center justify-center w-12 h-8 rounded-xl ${
                isFocused ? "bg-primary/10" : ""
              }`}
            >
              <MaterialIcons
                name={tabConfig.icon as any}
                size={22}
                color={isFocused ? "#0b55cf" : "#727785"}
              />
            </View>
            <Text
              className={`text-[10px] font-headline ${
                isFocused ? "text-primary font-bold" : "text-outline font-medium"
              }`}
            >
              {tabConfig.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
