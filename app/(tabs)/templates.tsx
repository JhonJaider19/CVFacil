import GlassHeader from "@/components/GlassHeader";
import GradientButton from "@/components/GradientButton";
import { getResume, getResumes, updateResumeTemplate } from "@/src/lib/api";
import { generateAndSharePdf } from "@/src/lib/pdf-export";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View, Alert } from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { normalizeResumeData } from "@/src/lib/types";
import { LinearGradient } from "expo-linear-gradient";

const TEMPLATES = [
  {
    id: "modern-beige",
    name: "Modern Beige",
    description: "Elegancia con tonos beige y foto de perfil",
    sidebarColor: "#f5f0eb",
    accentColor: "#8c6d58",
  },
  {
    id: "classic-ats",
    name: "Classic ATS",
    description: "Optimizado para sistemas de selección ATS",
    sidebarColor: "#ffffff",
    accentColor: "#000000",
  },
  {
    id: "elegant-dark",
    name: "Elegant Dark",
    description: "Estilo oscuro profesional con acentos dorados",
    sidebarColor: "#1a1a1a",
    accentColor: "#d4af37",
  },
];

export default function TemplatesScreen() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [selectedTemplate, setSelectedTemplate] = useState("modern-beige");

  const { data: previewResume } = useQuery({
    queryKey: ["resume", id],
    queryFn: () => getResume(id!),
    enabled: !!id,
  });

  const { data: resumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => getResumes(),
    enabled: !id,
  });

  const currentResume = previewResume ?? resumes?.[0];

  const updateMutation = useMutation({
    mutationFn: (templateId: string) => {
      if (!currentResume) throw new Error("No hay CV");
      return updateResumeTemplate(currentResume.id, templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (e: any) => {
      Alert.alert(
        "No se pudo cambiar la plantilla",
        e?.message || "Crea un CV antes de seleccionar una plantilla.",
      );
    },
  });

  function handleSelectTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    if (!currentResume) {
      Alert.alert(
        "Aún no tienes un CV",
        "Crea primero un currículum desde el editor para poder aplicarle una plantilla.",
      );
      return;
    }
    updateMutation.mutate(templateId);
  }

  const [pdfLoading, setPdfLoading] = useState(false);

  async function handleDownloadPdf() {
    if (!currentResume) return;
    setPdfLoading(true);
    try {
      const data = normalizeResumeData(currentResume.data);
      await generateAndSharePdf(data, selectedTemplate);
    } finally {
      setPdfLoading(false);
    }
  }

  const d = currentResume ? normalizeResumeData(currentResume.data) : null;
  const nombreCompleto = d ? `${d.nombre} ${d.apellido}`.trim() : "";

  return (
    <View className="flex-1 bg-surface">
      <GlassHeader />

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
            {d ? (
              <>
                <View className="border-b-2 border-primary/10 pb-4 flex-row justify-between items-start mb-6">
                  <View>
                    <Text className="font-headline text-2xl text-on-surface">
                      {nombreCompleto || "Nombre Completo"}
                    </Text>
                    <Text className="text-primary font-body-medium text-base">
                      {d.profesion || "Título Profesional"}
                    </Text>
                  </View>
                  <View className="items-end">
                    {d.correo && <Text className="text-xs text-on-surface-variant font-body">{d.correo}</Text>}
                    {d.telefono && <Text className="text-xs text-on-surface-variant font-body">{d.telefono}</Text>}
                    {d.ubicacion && <Text className="text-xs text-on-surface-variant font-body">{d.ubicacion}</Text>}
                  </View>
                </View>

                <View className="gap-4 mb-6">
                  {d.resumen && (
                    <View className="gap-2">
                      <Text className="text-[10px] font-body-bold tracking-widest text-primary uppercase">Perfil Profesional</Text>
                      <Text className="text-sm text-on-surface-variant font-body leading-relaxed">{d.resumen}</Text>
                    </View>
                  )}

                  {d.experiencias.length > 0 && (
                    <View className="gap-2">
                      <Text className="text-[10px] font-body-bold tracking-widest text-primary uppercase">Experiencia Laboral</Text>
                      {d.experiencias.map((exp, i) => (
                        <View key={i} className="gap-1 mb-2">
                          <View className="flex-row justify-between items-baseline">
                            <Text className="font-headline-semibold text-sm text-on-surface">{exp.puesto}</Text>
                            <Text className="text-[10px] text-on-surface-variant italic font-body">{exp.fechas}</Text>
                          </View>
                          <Text className="text-xs font-body-medium text-on-surface-variant">{exp.empresa}</Text>
                          {exp.logros.length > 0 ? (
                            exp.logros.map((l, li) => (
                              <Text key={li} className="text-xs text-on-surface-variant font-body mt-1">• {l}</Text>
                            ))
                          ) : null}
                        </View>
                      ))}
                    </View>
                  )}

                  {d.educacion.length > 0 && (
                    <View className="gap-2">
                      <Text className="text-[10px] font-body-bold tracking-widest text-primary uppercase">Educación</Text>
                      {d.educacion.map((edu, i) => (
                        <View key={i} className="flex-row justify-between items-baseline mb-1">
                          <View>
                            <Text className="font-headline-semibold text-sm text-on-surface">{edu.titulo}</Text>
                            <Text className="text-xs text-on-surface-variant font-body">{edu.institucion}</Text>
                          </View>
                          <Text className="text-[10px] text-on-surface-variant italic font-body">{edu.fechas}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {d.habilidades.length > 0 && (
                    <View className="flex-row flex-wrap gap-1">
                      {d.habilidades.map((s, i) => (
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
                    CV Optimizado al {currentResume?.score ?? 0}%
                  </Text>
                </View>
              </>
            ) : (
              <View className="items-center py-12">
                <MaterialIcons name="description" size={48} color="#bac7de" />
                <Text className="text-on-surface-variant font-body mt-4">Aún no tienes un CV</Text>
                <GradientButton className="mt-6" onPress={() => router.push("/editor" as any)}>
                  <MaterialIcons name="add-circle" size={20} color="#ffffff" />
                  <Text className="text-white text-lg font-headline">Crear mi primer CV</Text>
                </GradientButton>
              </View>
            )}
          </View>

          {/* Download */}
          {d && (
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
          )}

          {d && (
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
          )}
        </View>

        {/* Templates */}
        <View className="-mx-6 mb-8">
          <View className="flex-row justify-between items-center mb-6 px-6">
            <Text className="font-headline text-2xl tracking-tight text-on-surface">
              {d ? "Seleccionar Plantilla" : "Elige una plantilla para empezar"}
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingLeft: 24, paddingRight: 24 }}>
            {TEMPLATES.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <Pressable
                  key={template.id}
                  onPress={() => handleSelectTemplate(template.id)}
                >
                  <View className="w-64">
                    <View
                      className={`aspect-[1/1.41] rounded-xl mb-4 overflow-hidden relative ${
                        isSelected ? "border-2 border-primary" : "border border-outline-variant/20"
                      }`}
                    >
                      {/* Template preview card visual */}
                      <View className="flex-1 bg-white" style={{ padding: 0 }}>
                        {/* Sidebar/header visual según la plantilla */}
                        {template.id === "modern-beige" && (
                          <View className="flex-1 flex-row">
                            <View style={{ backgroundColor: "#f5f0eb", width: "35%", padding: 12, alignItems: "center" }}>
                              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#cec2b4", marginBottom: 12 }} />
                              <View style={{ height: 6, width: "100%", backgroundColor: "#cec2b4", borderRadius: 3, marginBottom: 4 }} />
                              <View style={{ height: 6, width: "70%", backgroundColor: "#cec2b4", borderRadius: 3, marginBottom: 16 }} />
                              <View style={{ height: 4, width: "100%", backgroundColor: "#cec2b4", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 4, width: "100%", backgroundColor: "#cec2b4", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 4, width: "60%", backgroundColor: "#cec2b4", borderRadius: 2 }} />
                            </View>
                            <View style={{ flex: 1, padding: 12 }}>
                              <View style={{ height: 10, width: "80%", backgroundColor: "#e8ddd4", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 8, width: "50%", backgroundColor: "#f0e8e0", borderRadius: 2, marginBottom: 12 }} />
                              <View style={{ height: 6, width: "100%", backgroundColor: "#f0e8e0", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 6, width: "90%", backgroundColor: "#f0e8e0", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 6, width: "70%", backgroundColor: "#f0e8e0", borderRadius: 2 }} />
                            </View>
                          </View>
                        )}
                        {template.id === "classic-ats" && (
                          <View className="flex-1" style={{ padding: 16 }}>
                            <View style={{ alignItems: "center", marginBottom: 12 }}>
                              <View style={{ height: 12, width: "70%", backgroundColor: "#e0e0e0", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 8, width: "40%", backgroundColor: "#eeeeee", borderRadius: 2 }} />
                            </View>
                            <View style={{ height: 1, backgroundColor: "#000", marginBottom: 12 }} />
                            <View style={{ height: 6, width: "100%", backgroundColor: "#f0f0f0", borderRadius: 2, marginBottom: 4 }} />
                            <View style={{ height: 6, width: "85%", backgroundColor: "#f0f0f0", borderRadius: 2, marginBottom: 12 }} />
                            <View style={{ height: 1, backgroundColor: "#000", marginBottom: 8 }} />
                            <View style={{ height: 6, width: "60%", backgroundColor: "#f0f0f0", borderRadius: 2, marginBottom: 4 }} />
                            <View style={{ height: 6, width: "50%", backgroundColor: "#f0f0f0", borderRadius: 2, marginBottom: 4 }} />
                            <View style={{ height: 6, width: "75%", backgroundColor: "#f0f0f0", borderRadius: 2 }} />
                          </View>
                        )}
                        {template.id === "elegant-dark" && (
                          <View className="flex-1">
                            <View style={{ backgroundColor: "#1a1a1a", padding: 16, alignItems: "center", borderBottomWidth: 3, borderBottomColor: "#d4af37" }}>
                              <View style={{ height: 10, width: "70%", backgroundColor: "#333", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 8, width: "40%", backgroundColor: "#d4af37", borderRadius: 2 }} />
                            </View>
                            <View style={{ padding: 12 }}>
                              <View style={{ height: 6, width: "100%", backgroundColor: "#f5f5f5", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 6, width: "80%", backgroundColor: "#f5f5f5", borderRadius: 2, marginBottom: 12 }} />
                              <View style={{ height: 6, width: "60%", backgroundColor: "#f5f5f5", borderRadius: 2, marginBottom: 4 }} />
                              <View style={{ height: 6, width: "50%", backgroundColor: "#f5f5f5", borderRadius: 2 }} />
                            </View>
                          </View>
                        )}
                      </View>

                      {isSelected && (
                        <View className="absolute inset-0 bg-white/40 items-center justify-center">
                          <View className="bg-primary px-3 py-1 rounded-full">
                            <Text className="text-white text-[10px] font-body-bold uppercase tracking-widest">Activo</Text>
                          </View>
                        </View>
                      )}
                      <View className="absolute inset-x-0 bottom-0 bg-primary/90 py-2 px-3">
                        <Text className="text-white text-[10px] font-body-bold text-center uppercase tracking-wider">
                          {d ? "Editar con esta plantilla" : "Usar esta plantilla"}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-headline-semibold text-on-surface">{template.name}</Text>
                    <Text className="text-xs text-on-surface-variant font-body">{template.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}