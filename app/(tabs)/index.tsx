import GlassHeader from "@/components/GlassHeader";
import GradientButton from "@/components/GradientButton";
import StatCard from "@/components/StatCard";
import CvCard from "@/components/CvCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAuth } from "@/src/lib/auth-context";
import { deleteResume, getLatestInterview, getResumes, getSuggestions } from "@/src/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";
import { MaterialIcons } from "@expo/vector-icons";

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { width: screenWidth } = useWindowDimensions();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const numColumns = screenWidth >= 1024 ? 3 : screenWidth >= 640 ? 2 : 1;
  const gap = 24;
  const cardWidth = screenWidth >= 640 ? (screenWidth - 48 - gap * (numColumns - 1)) / numColumns : undefined;

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: () => getResumes(user!.id),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", user?.id] });
    },
  });

  function confirmDelete(resume: { id: string; title: string }) {
    setDeleteTarget(resume);
  }

  const { data: interview } = useQuery({
    queryKey: ["latest-interview", user?.id],
    queryFn: () => getLatestInterview(user!.id),
    enabled: !!user,
  });

  const firstResumeId = resumes?.[0]?.id;
  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", firstResumeId],
    queryFn: () => getSuggestions(firstResumeId!),
    enabled: !!firstResumeId,
  });

  const name = profile?.name ?? "Usuario";
  const simScore = interview?.score ?? 0;
  const aiSuggestion = suggestions?.[0]?.suggestion;
  const resumeCount = resumes?.length ?? 0;
  const bestScore = resumes?.reduce((max, r) => Math.max(max, r.score || 0), 0) ?? 65;
  const profileScore = Math.max(bestScore, 65);
  const avatarUri = profile?.avatar_url || undefined;

  return (
    <View className="flex-1 bg-surface">
      <GlassHeader>
        <View className="flex-row items-center gap-4">
          <Pressable className="p-1 hover:bg-surface-container-low rounded-lg">
            <MaterialIcons name="notifications-none" size={24} color="#525f73" />
          </Pressable>
          <View className="w-8 h-8 rounded-full bg-secondary-container items-center justify-center overflow-hidden border border-outline-variant/15">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-full h-full object-cover" />
            ) : (
              <Text className="text-xs font-body-bold text-secondary">
                {name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </View>
      </GlassHeader>

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
              <Link href="/editor" asChild>
                <GradientButton>
                  <MaterialIcons name="add-circle" size={20} color="#ffffff" />
                  <Text className="text-white text-lg font-headline">Crear nuevo CV</Text>
                </GradientButton>
              </Link>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-6 mb-12">
            <View className="w-full sm:w-auto sm:flex-1 min-w-[280px]">
              <StatCard
                label="Última simulación"
                icon="🧠"
                iconBg="bg-tertiary-fixed"
                value={String(simScore)}
                subtitle="/10"
                trend={
                  simScore >= 7
                    ? "¡Excelente preparación!"
                    : "Sigue practicando"
                }
              />
            </View>

            {aiSuggestion && (
              <View className="w-full sm:flex-1 min-w-[280px] bg-tertiary-fixed/30 p-6 rounded-xl border border-tertiary-container/10 relative overflow-hidden">
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
              </View>
            )}
          </View>

          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="font-headline text-2xl text-on-surface">
                Mis Currículums
              </Text>
              <Pressable>
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
              <View className="flex-row flex-wrap" style={{ gap }}>
                {(resumes ?? []).map((resume) => (
                  <View key={resume.id} style={cardWidth ? { width: cardWidth } : { width: "100%" }}>
                    <View
                      className="rounded-xl overflow-hidden mb-4 border border-outline-variant/10 shadow-sm bg-surface-container-high"
                      style={{ aspectRatio: 3 / 4 }}
                    >
                      <Pressable
                        className="flex-1"
                        onPress={() => router.push(`/editor?id=${resume.id}`)}
                      >
                        <CvCard
                          data={resume.data}
                          templateId={resume.template_id || "moderno"}
                          score={resume.score || 0}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => confirmDelete(resume)}
                        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-surface/80 items-center justify-center"
                      >
                        <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
                      </Pressable>
                    </View>
                    <Pressable onPress={() => router.push(`/editor?id=${resume.id}`)}>
                      <Text className="font-headline text-lg text-on-surface">
                        {resume.title}
                      </Text>
                    </Pressable>
                    <Text className="text-on-surface-variant font-body text-sm mt-0.5">
                      Actualizado: {new Date(resume.updated_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))}

                <Link href="/editor" asChild>
                  <Pressable>
                    <View
                      className="border-2 border-dashed border-outline-variant/30 rounded-xl items-center justify-center hover:bg-surface-container-low transition-all"
                      style={cardWidth ? { width: cardWidth, aspectRatio: 3 / 4 } : { aspectRatio: 3 / 4, width: "100%" }}
                    >
                      <View className="w-16 h-16 rounded-full bg-secondary-container items-center justify-center mb-4">
                        <MaterialIcons name="add" size={28} color="#0b55cf" />
                      </View>
                      <Text className="font-headline text-on-surface-variant">
                        Nueva Versión
                      </Text>
                      <Text className="text-on-surface-variant/60 font-body text-xs text-center mt-2 px-8">
                        Crea una variante optimizada para un puesto específico
                      </Text>
                    </View>
                  </Pressable>
                </Link>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Eliminar CV"
        message={deleteTarget ? `¿Quieres borrar "${deleteTarget.title}"?` : ""}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
