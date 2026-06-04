import GlassHeader from "@/components/GlassHeader";
import GradientButton from "@/components/GradientButton";
import { useAuth } from "@/src/lib/auth-context";
import { getResumes, getTemplates, updateResumeTemplate } from "@/src/lib/api";
import { buildPdfHtml } from "@/src/lib/pdf-html";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";
import { useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function TemplatesScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("moderno");

  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const { data: resumes } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: () => getResumes(user!.id),
    enabled: !!user,
  });

  const currentResume = resumes?.[0];

  const updateMutation = useMutation({
    mutationFn: (templateId: string) => {
      if (!currentResume) throw new Error("No hay CV");
      return updateResumeTemplate(currentResume.id, templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", user?.id] });
    },
  });

  const [pdfLoading, setPdfLoading] = useState(false);

  async function handleDownloadPdf() {
    if (!currentResume) return;
    setPdfLoading(true);
    try {
      const html = buildPdfHtml(currentResume.data, selectedTemplate);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
      }
    } catch (e: any) {
      console.error("PDF error:", e);
    } finally {
      setPdfLoading(false);
    }
  }

  const templatesList = templates ?? [
    { id: "moderno", name: "Moderno", description: "Ideal para perfiles tech y diseño", category: "professional", thumbnail_url: null, styles: {}, is_active: true, created_at: "" },
    { id: "clasico", name: "Clásico", description: "Para sectores corporativos y banca", category: "classic", thumbnail_url: null, styles: {}, is_active: true, created_at: "" },
    { id: "creativo", name: "Creativo", description: "Perfecto para artes y publicidad", category: "creative", thumbnail_url: null, styles: {}, is_active: true, created_at: "" },
    { id: "minimalista", name: "Minimalista", description: "Menos es más. Enfoque puro.", category: "professional", thumbnail_url: null, styles: {}, is_active: true, created_at: "" },
  ];

  return (
    <View className="flex-1 bg-surface">
      <GlassHeader>
        <View className="flex-row items-center gap-4">
          <Pressable className="p-1 hover:bg-surface-container-low rounded-lg">
            <MaterialIcons name="notifications-none" size={24} color="#525f73" />
          </Pressable>
        </View>
      </GlassHeader>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 64 + STATUS_BAR_HEIGHT, paddingBottom: 32 }}
      >
        <View className="w-full max-w-6xl mx-auto px-6">
          {/* Preview */}
          <View className="flex-row justify-between items-end mb-6">
            <View>
              <Text className="font-headline text-2xl tracking-tight text-on-surface">
                Vista Previa
              </Text>
              {currentResume && (
                <Text className="text-on-surface-variant font-body text-sm opacity-70">
                  {currentResume.title} — Actualizado: {new Date(currentResume.updated_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>

          <View className="bg-white rounded-sm overflow-hidden p-6 mb-8 shadow-sm">
            {currentResume?.data ? (
              <>
                <View className="border-b-2 border-primary/10 pb-4 flex-row justify-between items-start mb-6">
                  <View>
                    <Text className="font-headline text-2xl text-on-surface">
                      {currentResume.data.fullName || "Nombre Completo"}
                    </Text>
                    <Text className="text-primary font-body-medium text-base">
                      {currentResume.data.title || "Título Profesional"}
                    </Text>
                  </View>
                  <View className="items-end">
                    {currentResume.data.email && <Text className="text-xs text-on-surface-variant font-body">{currentResume.data.email}</Text>}
                    {currentResume.data.phone && <Text className="text-xs text-on-surface-variant font-body">{currentResume.data.phone}</Text>}
                    {currentResume.data.location && <Text className="text-xs text-on-surface-variant font-body">{currentResume.data.location}</Text>}
                  </View>
                </View>

                <View className="gap-4 mb-6">
                  {currentResume.data.summary && (
                    <View className="gap-2">
                      <Text className="text-[10px] font-body-bold tracking-widest text-primary uppercase">Perfil Profesional</Text>
                      <Text className="text-sm text-on-surface-variant font-body leading-relaxed">{currentResume.data.summary}</Text>
                    </View>
                  )}

                  {(currentResume.data.experience?.filter(e => e.position || e.company).length ?? 0) > 0 && (
                    <View className="gap-2">
                      <Text className="text-[10px] font-body-bold tracking-widest text-primary uppercase">Experiencia Laboral</Text>
                      {currentResume.data.experience!.filter(e => e.position || e.company).map((exp, i) => (
                        <View key={i} className="gap-1 mb-2">
                          <View className="flex-row justify-between items-baseline">
                            <Text className="font-headline-semibold text-sm text-on-surface">{exp.position}</Text>
                            <Text className="text-[10px] text-on-surface-variant italic font-body">
                              {exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : ""}
                            </Text>
                          </View>
                          <Text className="text-xs font-body-medium text-on-surface-variant">{exp.company}</Text>
                          {exp.description ? <Text className="text-xs text-on-surface-variant font-body mt-1">{exp.description}</Text> : null}
                        </View>
                      ))}
                    </View>
                  )}

                  {(currentResume.data.education?.filter(e => e.degree || e.institution).length ?? 0) > 0 && (
                    <View className="gap-2">
                      <Text className="text-[10px] font-body-bold tracking-widest text-primary uppercase">Educación</Text>
                      {currentResume.data.education!.filter(e => e.degree || e.institution).map((edu, i) => (
                        <View key={i} className="flex-row justify-between items-baseline mb-1">
                          <View>
                            <Text className="font-headline-semibold text-sm text-on-surface">{edu.degree}</Text>
                            <Text className="text-xs text-on-surface-variant font-body">{edu.institution}</Text>
                          </View>
                          <Text className="text-[10px] text-on-surface-variant italic font-body">
                            {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {(currentResume.data.skills?.length ?? 0) > 0 && (
                    <View className="flex-row flex-wrap gap-1">
                      {currentResume.data.skills!.map((s, i) => (
                        <View key={i} className="bg-secondary-container px-2 py-0.5 rounded-full">
                          <Text className="text-[10px] font-body-bold text-secondary">{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View className="bg-tertiary-fixed self-start px-3 py-1.5 rounded-full flex-row items-center gap-2">
                  <MaterialIcons name="auto-fix-high" size={14} color="#002204" />
                  <Text className="text-[10px] font-body-bold text-on-tertiary-fixed">
                    CV Optimizado al {currentResume.score}%
                  </Text>
                </View>
              </>
            ) : (
              <View className="items-center py-12">
                <MaterialIcons name="description" size={48} color="#bac7de" />
                <Text className="text-on-surface-variant font-body mt-4">Crea un CV en el editor primero</Text>
              </View>
            )}
          </View>

          {/* Download */}
          <View className="bg-surface-container-low p-6 rounded-3xl mb-6">
            <Text className="font-headline text-xl text-on-surface mb-1">¿Todo listo?</Text>
            <Text className="text-on-surface-variant font-body text-sm leading-relaxed mt-1 mb-4">
              Tu CV está optimizado para sistemas ATS. Puedes descargarlo en PDF de alta calidad.
            </Text>
            <GradientButton onPress={handleDownloadPdf} disabled={!currentResume || pdfLoading}>
              <View className="flex-row items-center justify-center gap-2">
                <MaterialIcons name="file-download" size={20} color="#ffffff" />
                <Text className="text-white font-headline-semibold text-base">
                  {pdfLoading ? "Generando PDF..." : "Descargar PDF"}
                </Text>
              </View>
            </GradientButton>

          </View>

          <View className="flex-row gap-4 mb-10">
            <View className="flex-1 bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10">
              <MaterialIcons name="analytics" size={24} color="#0b55cf" style={{ marginBottom: 12 }} />
              <Text className="text-[10px] font-body-bold text-primary uppercase tracking-wider mb-1">Impacto</Text>
              <Text className="text-sm font-headline-semibold text-on-surface">Palabras clave detectadas</Text>
            </View>
            <View className="flex-1 bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10">
              <MaterialIcons name="verified" size={24} color="#1a6c23" style={{ marginBottom: 12 }} />
              <Text className="text-[10px] font-body-bold text-tertiary uppercase tracking-wider mb-1">Legibilidad</Text>
              <Text className="text-sm font-headline-semibold text-on-surface">Excelente puntuación</Text>
            </View>
          </View>
        </View>

        {/* Templates */}
        <View className="-mx-6 mb-8">
          <View className="flex-row justify-between items-center mb-6 px-6">
            <Text className="font-headline text-2xl tracking-tight text-on-surface">Seleccionar Plantilla</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {templatesList.map((template) => (
              <Pressable key={template.id} onPress={() => {
                setSelectedTemplate(template.id);
                if (currentResume) updateMutation.mutate(template.id);
              }}>
                <View className="w-64">
                  <View
                    className={`aspect-[1/1.41] rounded-xl mb-4 overflow-hidden items-center justify-center relative ${
                      selectedTemplate === template.id
                        ? "border-2 border-primary"
                        : "border border-outline-variant/20"
                    }`}
                  >
                    {template.thumbnail_url ? (
                      <Image source={{ uri: template.thumbnail_url }} className="w-full h-full object-cover opacity-75" />
                    ) : (
                      <View className="items-center justify-center flex-1 bg-surface-container-high">
                        <MaterialIcons name="auto-awesome" size={36} color="#bac7de" />
                        <Text className="text-on-surface-variant font-body text-xs mt-2">{template.name}</Text>
                      </View>
                    )}
                    {selectedTemplate === template.id && (
                      <View className="absolute inset-0 bg-white/40 items-center justify-center">
                        <View className="bg-primary px-3 py-1 rounded-full">
                          <Text className="text-white text-[10px] font-body-bold uppercase tracking-widest">Activo</Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <Text className="font-headline-semibold text-on-surface">{template.name}</Text>
                  <Text className="text-xs text-on-surface-variant font-body">{template.description}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
