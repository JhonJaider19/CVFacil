import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { buildPdfHtml } from "@/src/lib/pdf-html";
import type { ResumeData } from "@/src/lib/types";
import { normalizeResumeData } from "@/src/lib/types";

interface CvCardProps {
  data: ResumeData;
  templateId: string;
  score: number;
}

const SCALE = 0.23;

export default function CvCard({ data, templateId, score }: CvCardProps) {
  const d = normalizeResumeData(data);

  if (!d.nombre && !d.apellido && !d.profesion) {
    return (
      <View className="items-center justify-center flex-1 p-6">
        <MaterialIcons name="description" size={48} color="#bac7de" />
        <Text className="text-on-surface-variant font-body text-xs mt-2 text-center">
          CV vacío
        </Text>
      </View>
    );
  }

  const html = buildPdfHtml(d, templateId);

  return (
    <View className="flex-1 overflow-hidden bg-white" style={{ borderRadius: 4 }}>
      <View
        style={{
          width: `${100 / SCALE}%`,
          height: `${100 / SCALE}%`,
          transform: [{ scale: SCALE }],
          transformOrigin: "top left",
        }}
      >
        {React.createElement("div", {
          dangerouslySetInnerHTML: { __html: html },
        })}
      </View>
      <View className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
        <Text className="text-primary text-[10px] font-body-bold">{score}%</Text>
      </View>
    </View>
  );
}