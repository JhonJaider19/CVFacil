import GlassHeader from "@/components/GlassHeader";
import CvCard from "@/components/CvCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import GradientButton from "@/components/GradientButton";
import { useAuth } from "@/src/lib/auth-context";
import { deleteResume, getResumes } from "@/src/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";
import { MaterialIcons } from "@expo/vector-icons";

export default function ResumesScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { width: screenWidth } = useWindowDimensions();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const numColumns = screenWidth >= 1024 ? 3 : screenWidth >= 640 ? 2 : 1;
  const gap = 24;
  const cardWidth = screenWidth >= 640 ? (screenWidth - 48 - gap * (numColumns - 1)) / numColumns : undefined;

  const { data: resumes, isLoading } = useQuery({
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

  return (
    <View className="flex-1 bg-surface">
      <GlassHeader title="Mis Currículums" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 64 + STATUS_BAR_HEIGHT, paddingBottom: 40 }}
      >
        <View className="w-full max-w-6xl mx-auto px-6">
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="font-headline text-2xl text-on-surface">
                Todos tus CVs
              </Text>
              <Text className="text-on-surface-variant font-body text-sm mt-1">
                {resumes?.length ?? 0} currículum{(resumes?.length ?? 0) !== 1 ? "s" : ""} creado{(resumes?.length ?? 0) !== 1 ? "s" : ""}
              </Text>
            </View>
            <GradientButton onPress={() => router.push("/editor")}>
                <MaterialIcons name="add" size={18} color="#ffffff" />
                <Text className="text-white font-headline text-sm">Nuevo</Text>
              </GradientButton>
          </View>

          {isLoading ? (
            <Text className="text-on-surface-variant font-body">Cargando CVs...</Text>
          ) : (resumes ?? []).length === 0 ? (
            <View className="items-center py-20">
              <MaterialIcons name="description" size={64} color="#bac7de" />
              <Text className="text-on-surface-variant font-body text-lg mt-4 mb-2">No tienes currículums</Text>
              <Text className="text-on-surface-variant/60 font-body text-sm mb-6">Crea tu primer CV para empezar</Text>
              <GradientButton onPress={() => router.push("/editor")}>
                  <MaterialIcons name="add-circle" size={20} color="#ffffff" />
                  <Text className="text-white font-headline">Crear mi primer CV</Text>
                </GradientButton>
            </View>
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
                        templateId={resume.template_id || "modern-beige"}
                        score={resume.score || 0}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => setDeleteTarget(resume)}
                      className="absolute top-2 right-2 w-9 h-9 rounded-full bg-surface/80 items-center justify-center"
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
                    </Pressable>
                  </View>
                  <Pressable onPress={() => router.push(`/editor?id=${resume.id}`)}>
                    <Text className="font-headline text-lg text-on-surface">{resume.title}</Text>
                  </Pressable>
                  <Text className="text-on-surface-variant font-body text-sm mt-0.5">
                    Actualizado: {new Date(resume.updated_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
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