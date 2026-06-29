import GlassHeader from "@/components/GlassHeader";
import GradientButton from "@/components/GradientButton";
import ResumeGrid from "@/components/ResumeGrid";
import { deleteResume, getResumes } from "@/src/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";
import { MaterialIcons } from "@expo/vector-icons";

export default function ResumesScreen() {
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
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}