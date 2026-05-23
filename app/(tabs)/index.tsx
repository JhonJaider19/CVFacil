import GlassHeader from "@/components/GlassHeader";
import GradientButton from "@/components/GradientButton";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/src/lib/auth-context";
import { getLatestInterview, getResumes, getSuggestions } from "@/src/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

function useDashboardData(userId: string | undefined) {
  const resumes = useQuery({
    queryKey: ["resumes", userId],
    queryFn: () => getResumes(userId!),
    enabled: !!userId,
  });

  const interview = useQuery({
    queryKey: ["latest-interview", userId],
    queryFn: () => getLatestInterview(userId!),
    enabled: !!userId,
  });

  const firstResumeId = resumes.data?.[0]?.id;
  const suggestions = useQuery({
    queryKey: ["suggestions", firstResumeId],
    queryFn: () => getSuggestions(firstResumeId!),
    enabled: !!firstResumeId,
  });

  const totalViews = resumes.data?.reduce(
    (sum, r) => sum + (r.score || 0),
    0,
  );

  return { resumes, interview, suggestions, totalViews };
}

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const { resumes, interview, suggestions, totalViews } = useDashboardData(user?.id);

  const name = profile?.name ?? "Usuario";
  const simScore = interview.data?.score ?? 0;
  const aiSuggestion = suggestions.data?.[0]?.suggestion;
  const resumeCount = resumes.data?.length ?? 0;
  const bestScore = resumes.data?.reduce((max, r) => Math.max(max, r.score || 0), 0) ?? 65;
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
        contentContainerStyle={{ paddingTop: 96, paddingBottom: 32 }}
      >
        <View className="px-6">
          <View className="mb-10">
            <View className="flex-col gap-4">
              <View>
                <Text className="font-headline text-3xl text-on-surface tracking-tight mb-2">
                  ¡Hola, {name}! 👋
                </Text>
                <Text className="text-on-surface-variant text-body text-base leading-relaxed">
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

          <View className="gap-6 mb-12">
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

            <StatCard
              label="Visualizaciones"
              icon="👁️"
              iconBg="bg-secondary-container"
              value={String(totalViews ?? 0)}
              trend="+12% respecto a la semana pasada"
            />

            {aiSuggestion && (
              <View className="bg-tertiary-fixed/30 p-6 rounded-xl border border-tertiary-container/10 relative overflow-hidden">
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

            {resumes.isLoading ? (
              <Text className="text-on-surface-variant font-body">
                Cargando CVs...
              </Text>
            ) : (
              <View className="gap-8">
                {(resumes.data ?? []).map((resume) => {
                  const thumbUri = resume.thumbnail_url || undefined;
                  return (
                    <Pressable key={resume.id} className="group">
                      <View className="relative">
                        <View
                          className="rounded-xl overflow-hidden mb-4 border border-outline-variant/10 shadow-sm bg-surface-container-high items-center justify-center"
                          style={{ aspectRatio: 3 / 4 }}
                        >
                          {thumbUri ? (
                            <Image source={{ uri: thumbUri }} className="flex-1 object-cover" />
                          ) : (
                            <View className="items-center justify-center p-6">
                              <MaterialIcons name="description" size={48} color="#bac7de" />
                              <Text className="text-on-surface-variant font-body text-xs mt-2 text-center">{resume.title}</Text>
                            </View>
                          )}
                          <View className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm">
                            <Text className="text-primary text-[10px] font-body-bold">
                              {resume.score}%
                            </Text>
                          </View>
                        </View>
                        <Text className="font-headline text-lg text-on-surface">
                          {resume.title}
                        </Text>
                        <Text className="text-on-surface-variant font-body text-sm mt-0.5">
                          Actualizado: {new Date(resume.updated_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}

                <Link href="/editor" asChild>
                  <Pressable>
                    <View className="border-2 border-dashed border-outline-variant/30 rounded-xl items-center justify-center aspect-[3/4] hover:bg-surface-container-low transition-all">
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
    </View>
  );
}
