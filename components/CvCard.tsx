import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { ResumeData } from "@/src/lib/types";

interface CvCardProps {
  data: ResumeData;
  templateId: string;
  score: number;
}

export default React.memo(function CvCard({ data, score }: CvCardProps) {
  if (!data?.fullName && !data?.title) {
    return (
      <View className="items-center justify-center flex-1 p-6">
        <MaterialIcons name="description" size={48} color="#bac7de" />
        <Text className="text-on-surface-variant font-body text-xs mt-2 text-center">
          CV vacío
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-5 rounded-sm">
      <View className="border-b-2 border-primary/10 pb-3 mb-4">
        <Text
          className="font-headline-bold text-base text-[#191c1d]"
          numberOfLines={1}
        >
          {data.fullName || "Nombre Completo"}
        </Text>
        <Text className="text-[10px] font-body-medium text-[#0b55cf]" numberOfLines={1}>
          {data.title || ""}
        </Text>
      </View>

      {data.summary ? (
        <Text className="text-[9px] text-[#3f4447] font-body leading-relaxed mb-3" numberOfLines={3}>
          {data.summary}
        </Text>
      ) : null}

      <View className="flex-row items-center gap-1">
        <MaterialIcons name="auto-fix-high" size={12} color="#1a6c23" />
        <Text className="text-[9px] font-body-bold text-[#1a6c23]">
          {score}%
        </Text>
      </View>
    </View>
  );
});
