import GlassHeader from "@/components/GlassHeader";
import GradientButton from "@/components/GradientButton";
import { useAuth } from "@/src/lib/auth-context";
import { getResumes, getTemplates, updateResumeTemplate } from "@/src/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";


function buildPdfHtml(data: any, templateId: string) {
  const d = data || {};
  const primaryColor = templateId === "creativo" ? "#37863a" : templateId === "clasico" ? "#525f73" : "#0b55cf";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  @page { margin: 0; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
  body { background: white; padding: 48px 40px; color: #1a1c1e; font-size: 11px; line-height: 1.6; }
  h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #191c1d; margin-bottom: 2px; }
  h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}20; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; }
  .subtitle { font-size: 14px; color: ${primaryColor}; font-weight: 600; margin-bottom: 12px; }
  .contact { display: flex; gap: 16px; font-size: 11px; color: #525f73; margin-bottom: 20px; flex-wrap: wrap; }
  .exp-item { margin-bottom: 14px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-title { font-weight: 700; font-size: 13px; color: #191c1d; }
  .exp-date { font-size: 10px; color: #727785; font-style: italic; }
  .exp-company { font-size: 11px; color: ${primaryColor}; font-weight: 500; margin-bottom: 4px; }
  .exp-desc { font-size: 11px; color: #3f4447; }
  .edu-item { margin-bottom: 10px; }
  .skill-tag { display: inline-block; background: ${primaryColor}10; color: #191c1d; padding: 2px 10px; border-radius: 12px; font-size: 10px; margin: 2px 4px 2px 0; }
  .summary { font-size: 11px; color: #3f4447; margin-bottom: 20px; line-height: 1.7; }
  .score-badge { display: inline-block; background: ${primaryColor}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; margin-bottom: 16px; }
</style></head>
<body>
  <h1>${d.fullName || "Nombre Completo"}</h1>
  <div class="subtitle">${d.title || ""}</div>
  <div class="contact">
    ${d.email ? `<span>${d.email}</span>` : ""}
    ${d.phone ? `<span>${d.phone}</span>` : ""}
    ${d.location ? `<span>${d.location}</span>` : ""}
  </div>
  ${d.summary ? `<div class="score-badge">CV Optimizado</div><div class="summary">${d.summary}</div>` : ""}
  ${(d.experience || []).filter((e: any) => e.position || e.company).length ? `<h2>Experiencia Laboral</h2>` : ""}
  ${(d.experience || []).filter((e: any) => e.position || e.company).map((exp: any) => `
    <div class="exp-item">
      <div class="exp-header">
        <span class="exp-title">${exp.position}</span>
        <span class="exp-date">${exp.startDate ? exp.startDate : ""}${exp.endDate ? " — " + exp.endDate : ""}</span>
      </div>
      <div class="exp-company">${exp.company}</div>
      ${exp.description ? `<div class="exp-desc">${exp.description}</div>` : ""}
    </div>
  `).join("")}
  ${(d.education || []).filter((e: any) => e.degree || e.institution).length ? `<h2>Educación</h2>` : ""}
  ${(d.education || []).filter((e: any) => e.degree || e.institution).map((edu: any) => `
    <div class="edu-item">
      <div class="exp-header">
        <span class="exp-title">${edu.degree}</span>
        <span class="exp-date">${edu.startDate ? edu.startDate : ""}${edu.endDate ? " — " + edu.endDate : ""}</span>
      </div>
      <div class="exp-company">${edu.institution}</div>
    </div>
  `).join("")}
  ${(d.skills || []).length ? `<h2>Habilidades</h2>` : ""}
  <div>${(d.skills || []).map((s: string) => `<span class="skill-tag">${s}</span>`).join("")}</div>
</body></html>`;
}

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
        contentContainerStyle={{ paddingTop: 96, paddingBottom: 32 }}
      >
        <View className="px-6">
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
            <View className="flex-row items-center gap-4 pt-4 mt-4 border-t border-outline-variant/15">
              <View className="flex-row">
                {["JD", "MS", "AL"].map((initials, i) => (
                  <View key={initials} className={`w-8 h-8 rounded-full bg-secondary-container border-2 border-surface items-center justify-center ${i > 0 ? "-ml-2" : ""}`}>
                    <Text className="text-[10px] font-body-bold text-secondary">{initials}</Text>
                  </View>
                ))}
              </View>
              <Text className="text-[11px] text-on-surface-variant font-body-medium">Revisado por expertos en reclutamiento</Text>
            </View>
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
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-6">
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
