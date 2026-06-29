import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export interface ChatMessageData {
  id: string;
  type: "ai" | "user";
  text: string;
  time?: string;
  authorLabel?: string;
}

interface ChatMessageProps {
  msg: ChatMessageData;
  authorLabel?: string;
}

export default function ChatMessage({ msg, authorLabel }: ChatMessageProps) {
  const defaultLabel = authorLabel ?? (msg.type === "ai" ? "Asistente IA" : "Tú");
  return (
    <View className="flex-row gap-3 mb-6">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${
          msg.type === "ai" ? "bg-primary-container" : "bg-secondary-container"
        }`}
      >
        <MaterialIcons
          name={msg.type === "ai" ? "smart-toy" : "person"}
          size={20}
          color="#ffffff"
        />
      </View>
      <View className="flex-1">
        <View
          className={`p-4 rounded-2xl ${
            msg.type === "ai" ? "bg-white rounded-tl-none" : "bg-primary/5 rounded-tr-none"
          }`}
        >
          <Text className="text-on-surface font-body leading-relaxed">
            {msg.text}
          </Text>
        </View>
        {msg.time && (
          <Text className="text-[11px] text-outline font-body-medium px-1 mt-1">
            {defaultLabel} • {msg.time}
          </Text>
        )}
      </View>
    </View>
  );
}