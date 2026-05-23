import { LinearGradient } from "expo-linear-gradient";
import { Pressable, PressableProps, Text, ViewProps } from "react-native";

interface GradientButtonProps extends PressableProps {
  colors?: readonly [string, string];
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export default function GradientButton({
  colors = ["#0b55cf", "#3870ea"] as readonly [string, string],
  className = "",
  textClassName = "",
  children,
  ...props
}: GradientButtonProps) {
  return (
    <Pressable {...props}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`h-14 px-8 rounded-xl items-center justify-center flex-row gap-3 ${className}`}
      >
        {typeof children === "string" ? (
          <Text className={`text-white text-lg font-headline ${textClassName}`}>
            {children}
          </Text>
        ) : (
          children
        )}
      </LinearGradient>
    </Pressable>
  );
}
