import { Pressable, Text, View } from "react-native";

interface AiChipProps {
  label: string;
  onPress?: () => void;
  variant?: "suggestion" | "tip" | "insight";
}

export default function AiChip({ label, onPress, variant = "suggestion" }: AiChipProps) {
  const styles = {
    suggestion: "bg-secondary-container",
    tip: "bg-tertiary-fixed",
    insight: "bg-primary-fixed",
  };

  const textStyles = {
    suggestion: "text-secondary",
    tip: "text-on-tertiary-fixed",
    insight: "text-on-primary-fixed",
  };

  return (
    <Pressable
      onPress={onPress}
      className={`${styles[variant]} px-4 py-2 rounded-full flex-row items-center gap-2 self-start`}
    >
      <Text className={`text-xs font-body-bold ${textStyles[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
