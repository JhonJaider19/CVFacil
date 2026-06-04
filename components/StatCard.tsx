import React from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  label: string;
  icon: string;
  iconBg?: string;
  value: string;
  subtitle?: string;
  trend?: string;
  className?: string;
}

export default React.memo(function StatCard({
  label,
  icon,
  iconBg = "bg-tertiary-fixed",
  value,
  subtitle,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <View className={`bg-surface-container-lowest p-6 rounded-xl ${className}`}>
      <View className="flex-row items-start justify-between">
        <Text className="text-on-surface-variant font-body-medium text-sm">
          {label}
        </Text>
        <View className={`p-2 ${iconBg} rounded-lg`}>
          <Text className="text-lg">{icon}</Text>
        </View>
      </View>
      <View className="mt-4">
        <View className="flex-row items-baseline gap-1">
          <Text className="text-4xl font-headline text-on-surface">
            {value}
          </Text>
          {subtitle && (
            <Text className="text-on-surface-variant text-lg">{subtitle}</Text>
          )}
        </View>
        {trend && (
          <Text className="text-tertiary text-xs font-body-bold mt-1">
            {trend}
          </Text>
        )}
      </View>
    </View>
  );
});
