import GlassHeader from "@/components/GlassHeader";
import GradientButton from "@/components/GradientButton";
import ResumeGrid from "@/components/ResumeGrid";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/src/lib/auth-context";
import { deleteResume, getLatestInterview, getResumes, getSuggestions } from "@/src/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";
import { MaterialIcons } from "@expo/vector-icons";

export default function DashboardScreen() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { width: screenWidth } = useWindowDimensions();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const numColumns = screenWidth >= 1024 ? 3 : screenWidth >= 640 ? 2 : 1;
  const gap = 24;
  const cardWidth = screenWidth >= 640 ? (screenWidth - 48 - gap * (numColumns - 1)) / numColumns : undefined;

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => getResumes(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  const { data: interview } = useQuery({
    queryKey: ["latest-interview"],
    queryFn: () => getLatestInterview(),
  });

  const firstResumeId = resumes?.[0]?.id;
  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", firstResumeId],
    queryFn: () => getSuggestions(firstResumeId!),
    enabled: !!firstResumeId,
  });

  const name = profile?.name ?? "";
  const simScore = interview?.score ?? 0;
  const aiSuggestion = suggestions?.[0]?.suggestion;
  const resumeCount = resumes?.length ?? 0;
  const bestScore = resumes?.reduce((max, r) => Math.max(max, r.score || 0), 0) ?? 65;
  const profileScore = Math.max(bestScore, 65);

  return (
    <View className="flex-1 bg-surface">
      <GlassHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 64 + STATUS_BAR_HEIGHT, paddingBottom: 32 }}
      >
        <View className="w-full max-w-6xl mx-auto px-6">
          <View className="mb-10">
            <View className="flex-col gap-4">
              <View>
                <Text className="font-headline text-3xl text-on-surface tracking-tight mb-2">
                  ¡Hola, {name}! 👋
                </Text>
                <Text className="text-on-surface-variant text-body text-base leading-relaxed max-w-2xl">
                  Tu perfil profesional está al {profileScore}%. Una pequeña
                  mejora en tu experiencia laboral podría aumentar tus matches
                  hoy.
                </Text>
              </View>
              <GradientButton onPress={() => router.push("/editor")}>
                  <MaterialIcons name="add-circle" size={20} color="#ffffff" />
                  <Text className="text-white text-lg font-headline">Crear nuevo CV</Text>
                </GradientButton>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-6 mb-12">
            <View className="w-full sm:w-auto sm:flex-1 min-w-[280px]">
              <StatCard
                label="Última simulación"
                icon="🧠"
                iconBg="bg-tertiary-fixed"
                value={String(simScore)}
                subtitle="/100"
                trend={
                  simScore >= 70
                    ? "¡Excelente preparación!"
                    : "Sigue practicando"
                }
              />
            </View>

            {aiSuggestion && (
              <Pressable
                onPress={() => firstResumeId && router.push(`/editor?id=${firstResumeId}`)}
                disabled={!firstResumeId}
                className="w-full sm:flex-1 min-w-[280px] bg-tertiary-fixed/30 p-6 rounded-xl border border-tertiary-container/10 relative overflow-hidden active:opacity-80"
              >
                <View className="flex-row items-center gap-2 mb-3">
                  <MaterialIcons name="auto-awesome" size={18} color="#1a6c23" />
                  <Text className="text-on-tertiary-fixed font-headline text-sm uppercase tracking-wider">
                    AI SUGGESTION
                  </Text>
                </View>
                <Text className="text-on-surface font-body text-sm leading-tight">
                  {aiSuggestion}
                </Text>
                <View className="flex-row items-center gap-2 mt-4">
                  <Text className="text-tertiary font-headline-semibold text-sm">
                    Optimizar ahora
                  </Text>
                  <MaterialIcons name="arrow-forward" size={14} color="#1a6c23" />
                </View>
              </Pressable>
            )}
          </View>

          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="font-headline text-2xl text-on-surface">
                Mis Currículums
              </Text>
              <Pressable onPress={() => router.push("/resumes" as any)}>
                <Text className="text-primary font-body-bold text-sm">
                  Ver todos
                </Text>
              </Pressable>
            </View>

            {resumesLoading ? (
              <Text className="text-on-surface-variant font-body">
                Cargando CVs...
              </Text>
            ) : (
              <ResumeGrid
                resumes={resumes ?? []}
                onDelete={(id, title) => setDeleteTarget({ id, title })}
                deleteTarget={deleteTarget}
                setDeleteTarget={setDeleteTarget}
                onConfirmDelete={() => {
                  if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                onCancelDelete={() => setDeleteTarget(null)}
                cardWidth={cardWidth}
                showCreateCard
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
