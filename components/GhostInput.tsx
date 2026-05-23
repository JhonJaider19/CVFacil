import { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface GhostInputProps extends TextInputProps {
  label: string;
}

export default function GhostInput({ label, className = "", onFocus, onBlur, ...props }: GhostInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="gap-2">
      <Text className={`text-sm font-title transition-colors duration-200 ${isFocused ? "text-primary font-semibold" : "text-on-surface-variant"}`}>
        {label}
      </Text>
      <TextInput
        className={`text-lg text-on-surface border-b-2 pb-3 ${className}`}
        placeholderTextColor="#727785"
        style={{ borderColor: isFocused ? "#0b55cf" : "rgba(193, 198, 214, 0.2)" }}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}
