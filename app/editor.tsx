import { useCurrentUserId } from "@/src/lib/use-current-user";
import {
  createResume,
  getResume,
  updateResume,
  uploadResumePhoto,
} from "@/src/lib/api";
import { generateCvScore, chatCompletion } from "@/src/lib/ai-service";
import { generateAndSharePdf } from "@/src/lib/pdf-export";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, Image, Alert, ActivityIndicator } from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import GlassHeader from "@/components/GlassHeader";
import GhostInput from "@/components/GhostInput";
import AiChip from "@/components/AiChip";
import type { ResumeData, Experiencia, Educacion, Idioma, Certificacion } from "@/src/lib/types";
import { normalizeResumeData } from "@/src/lib/types";
import * as ImagePicker from "expo-image-picker";

export default function EditorScreen() {
  const { id: urlId, templateId } = useLocalSearchParams<{ id?: string; templateId?: string }>();
  const queryClient = useQueryClient();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const [resumeId, setResumeId] = useState<string | undefined>(urlId);
  const getUserId = useCurrentUserId();

  const { data: resumeData } = useQuery({
    queryKey: ["resume", resumeId],
    queryFn: () => getResume(resumeId!),
    enabled: !!resumeId,
  });

  // Estado del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [profesion, setProfesion] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resumen, setResumen] = useState("");

  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [educacion, setEducacion] = useState<Educacion[]>([]);
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [habilidadInput, setHabilidadInput] = useState("");
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [interesInput, setInteresInput] = useState("");
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);

  const [currentTemplateId, setCurrentTemplateId] = useState(templateId || "modern-beige");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Cargar datos existentes
  useEffect(() => {
    if (!resumeData) return;
    const d = normalizeResumeData(resumeData.data);
    setNombre(d.nombre);
    setApellido(d.apellido);
    setProfesion(d.profesion);
    setFotoUri(d.fotoUri);
    setTelefono(d.telefono);
    setCorreo(d.correo);
    setUbicacion(d.ubicacion);
    setLinkedin(d.linkedin);
    setResumen(d.resumen);
    setExperiencias(d.experiencias.length ? d.experiencias : []);
    setEducacion(d.educacion.length ? d.educacion : []);
    setHabilidades(d.habilidades);
    setIdiomas(d.idiomas);
    setIntereses(d.intereses);
    setCertificaciones(d.certificaciones);
    if (resumeData.template_id) setCurrentTemplateId(resumeData.template_id);
  }, [resumeData]);

  const buildData = useCallback((): ResumeData => ({
    nombre, apellido, profesion, fotoUri, telefono, correo, ubicacion, linkedin, resumen,
    experiencias,
    educacion,
    habilidades,
    idiomas,
    intereses,
    certificaciones,
  }), [nombre, apellido, profesion, fotoUri, telefono, correo, ubicacion, linkedin, resumen,
      experiencias, educacion, habilidades, idiomas, intereses, certificaciones]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = buildData();
      const score = await generateCvScore(data);
      if (resumeId) {
        return updateResume(resumeId, { data, score, template_id: currentTemplateId });
      }
      const userId = await getUserId();
      if (!userId) throw new Error("No hay sesión activa");
      const title = (() => {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, "0");
        const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hh = now.getHours().toString().padStart(2, "0");
        const mm = now.getMinutes().toString().padStart(2, "0");
        return `Borrador ${day} ${month} ${year} ${hh}:${mm}`;
      })();
      const newResume = await createResume(userId, title, {
        data,
        templateId: currentTemplateId,
        score,
      });
      setResumeId(newResume.id);
      return newResume;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      const savedId = result?.id || resumeId;
      if (savedId) {
        queryClient.invalidateQueries({ queryKey: ["resume", savedId] });
      }
    },
    onError: (e: any) => {
      Alert.alert("Error al guardar", e?.message || "No se pudo guardar el borrador");
    },
    onSettled: () => {
      isSavingRef.current = false;
    },
  });

  const scheduleSave = useCallback(() => {
    if (isSavingRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      isSavingRef.current = true;
      saveMutation.mutate();
    }, 2000);
  }, [saveMutation]);

  async function pickImage() {
    const userId = await getUserId();
    if (!userId) {
      Alert.alert("Sesión requerida", "Inicia sesión para agregar una foto de perfil.");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para agregar una foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    await uploadAndSetPhoto(result.assets[0].uri);
  }

  async function takePhoto() {
    const userId = await getUserId();
    if (!userId) {
      Alert.alert("Sesión requerida", "Inicia sesión para agregar una foto de perfil.");
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a la cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    await uploadAndSetPhoto(result.assets[0].uri);
  }

  async function uploadAndSetPhoto(localUri: string) {
    const userId = await getUserId();
    if (!userId) return;
    setPhotoUploading(true);
    try {
      const url = await uploadResumePhoto(localUri, userId);
      setFotoUri(url);
      scheduleSave();
    } catch (e: any) {
      Alert.alert(
        "No se pudo subir la foto",
        e?.message || "Verifica tu conexión o que el bucket 'avatars' exista en InsForge Storage.",
      );
    } finally {
      setPhotoUploading(false);
    }
  }

  function handleSelectPhoto() {
    Alert.alert("Foto de perfil", "Elige una opción", [
      { text: "Galería", onPress: pickImage },
      { text: "Cámara", onPress: takePhoto },
      ...(fotoUri ? [{ text: "Eliminar foto", style: "destructive" as const, onPress: () => { setFotoUri(null); scheduleSave(); } }] : []),
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  // Helpers para experiencias
  function addExperiencia() {
    if (experiencias.length >= 10) return;
    setExperiencias([...experiencias, { puesto: "", empresa: "", fechas: "", ciudad: "", logros: [""] }]);
    scheduleSave();
  }

  function removeExperiencia(index: number) {
    setExperiencias(experiencias.filter((_, i) => i !== index));
    scheduleSave();
  }

  function updateExperiencia(index: number, field: keyof Experiencia, value: any) {
    const updated = experiencias.map((exp, i) => i === index ? { ...exp, [field]: value } : exp);
    setExperiencias(updated);
    scheduleSave();
  }

  function addLogro(expIndex: number) {
    const updated = experiencias.map((exp, i) =>
      i === expIndex ? { ...exp, logros: [...exp.logros, ""] } : exp
    );
    setExperiencias(updated);
  }

  function updateLogro(expIndex: number, logroIndex: number, value: string) {
    const updated = experiencias.map((exp, i) =>
      i === expIndex ? {
        ...exp,
        logros: exp.logros.map((l, li) => li === logroIndex ? value : l),
      } : exp
    );
    setExperiencias(updated);
    scheduleSave();
  }

  function removeLogro(expIndex: number, logroIndex: number) {
    const updated = experiencias.map((exp, i) =>
      i === expIndex ? {
        ...exp,
        logros: exp.logros.filter((_, li) => li !== logroIndex),
      } : exp
    );
    setExperiencias(updated);
  }

  // Helpers para educación
  function addEducacion() {
    if (educacion.length >= 10) return;
    setEducacion([...educacion, { titulo: "", institucion: "", fechas: "", ciudad: "" }]);
    scheduleSave();
  }

  function removeEducacion(index: number) {
    setEducacion(educacion.filter((_, i) => i !== index));
    scheduleSave();
  }

  function updateEducacion(index: number, field: keyof Educacion, value: string) {
    const updated = educacion.map((edu, i) => i === index ? { ...edu, [field]: value } : edu);
    setEducacion(updated);
    scheduleSave();
  }

  // Helpers para habilidades
  function addHabilidad() {
    const trimmed = habilidadInput.trim();
    if (!trimmed || habilidades.includes(trimmed)) return;
    setHabilidades([...habilidades, trimmed]);
    setHabilidadInput("");
    scheduleSave();
  }

  function removeHabilidad(skill: string) {
    setHabilidades(habilidades.filter(s => s !== skill));
    scheduleSave();
  }

  // Helpers para idiomas
  function addIdioma() {
    setIdiomas([...idiomas, { nombre: "", nivel: "" }]);
    scheduleSave();
  }

  function updateIdioma(index: number, field: keyof Idioma, value: string) {
    const updated = idiomas.map((idi, i) => i === index ? { ...idi, [field]: value } : idi);
    setIdiomas(updated);
    scheduleSave();
  }

  function removeIdioma(index: number) {
    setIdiomas(idiomas.filter((_, i) => i !== index));
    scheduleSave();
  }

  // Helpers para intereses
  function addInteres() {
    const trimmed = interesInput.trim();
    if (!trimmed || intereses.includes(trimmed)) return;
    setIntereses([...intereses, trimmed]);
    setInteresInput("");
    scheduleSave();
  }

  function removeInteres(item: string) {
    setIntereses(intereses.filter(i => i !== item));
    scheduleSave();
  }

  // Helpers para certificaciones
  function addCertificacion() {
    setCertificaciones([...certificaciones, { nombre: "", institucion: "", fechas: "" }]);
    scheduleSave();
  }

  function updateCertificacion(index: number, field: keyof Certificacion, value: string) {
    const updated = certificaciones.map((cert, i) => i === index ? { ...cert, [field]: value } : cert);
    setCertificaciones(updated);
    scheduleSave();
  }

  function removeCertificacion(index: number) {
    setCertificaciones(certificaciones.filter((_, i) => i !== index));
    scheduleSave();
  }

  // Calcular score
  const allData = buildData();
  const totalFields = 12;
  const filledFields = [
    allData.nombre, allData.apellido, allData.profesion,
    allData.telefono, allData.correo, allData.resumen,
    allData.experiencias.length > 0 ? "x" : "",
    allData.educacion.length > 0 ? "x" : "",
    allData.habilidades.length > 0 ? "x" : "",
    allData.idiomas.length > 0 ? "x" : "",
    allData.intereses.length > 0 ? "x" : "",
    allData.certificaciones.length > 0 ? "x" : "",
  ].filter(Boolean).length;
  const score = Math.round((filledFields / totalFields) * 100);

  const [pdfLoading, setPdfLoading] = useState(false);

  async function handlePreview() {
    setPdfLoading(true);
    try {
      await generateAndSharePdf(buildData(), currentTemplateId);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <GlassHeader title="Editor de CV" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 64 + STATUS_BAR_HEIGHT, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-6xl mx-auto px-6">
          {/* Progress Bar */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-3">
              <Text className="font-headline text-2xl tracking-tight text-on-surface">
                Tu Trayectoria Profesional
              </Text>
              <Text className="text-primary font-body-bold text-sm">
                {score}% completado
              </Text>
            </View>
            <View className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <LinearGradient
                colors={["#0b55cf", "#3870ea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full rounded-full"
                style={{ width: `${score}%` }}
              />
            </View>
          </View>

          {/* Personal Info */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <MaterialIcons name="person" size={20} color="#0b55cf" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Información Personal</Text>
            </View>
            <View className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm" style={{ gap: 20 }}>
              {/* Photo */}
              <View className="flex-row items-center gap-4">
                <Pressable onPress={handleSelectPhoto} disabled={photoUploading}>
                  <View className="w-20 h-20 rounded-full bg-secondary-container items-center justify-center overflow-hidden border border-outline-variant/20">
                    {photoUploading ? (
                      <ActivityIndicator size="small" color="#525f73" />
                    ) : fotoUri ? (
                      <Image source={{ uri: fotoUri }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <MaterialIcons name="camera-alt" size={28} color="#525f73" />
                    )}
                  </View>
                </Pressable>
                <View className="flex-1">
                  <Text className="font-headline text-base text-on-surface">Foto de perfil</Text>
                  <Text className="text-on-surface-variant font-body text-xs mt-1">
                    {fotoUri ? "Presiona para cambiar o eliminar" : "Presiona para agregar una foto"}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <GhostInput label="Nombre" placeholder="Tu nombre" value={nombre} onChangeText={v => { setNombre(v); scheduleSave(); }} />
                </View>
                <View className="flex-1">
                  <GhostInput label="Apellido" placeholder="Tu apellido" value={apellido} onChangeText={v => { setApellido(v); scheduleSave(); }} />
                </View>
              </View>
              <GhostInput label="Título Profesional" placeholder="Ej: Arquitecta, Diseñadora UX" value={profesion} onChangeText={v => { setProfesion(v); scheduleSave(); }} />
              <GhostInput label="Correo Electrónico" placeholder="email@ejemplo.com" value={correo} onChangeText={v => { setCorreo(v); scheduleSave(); }} keyboardType="email-address" />
              <GhostInput label="Teléfono" placeholder="+34 600 000 000" value={telefono} onChangeText={v => { setTelefono(v); scheduleSave(); }} keyboardType="phone-pad" />
              <GhostInput label="Ubicación" placeholder="Madrid, España" value={ubicacion} onChangeText={v => { setUbicacion(v); scheduleSave(); }} />
              <GhostInput label="LinkedIn" placeholder="linkedin.com/in/tuperfil" value={linkedin} onChangeText={v => { setLinkedin(v); scheduleSave(); }} />
            </View>
          </View>

          {/* Resumen */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <MaterialIcons name="article" size={20} color="#0b55cf" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Resumen Profesional</Text>
            </View>
            <View className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm" style={{ gap: 20 }}>
              <TextInput
                className="text-on-surface font-body text-base leading-relaxed"
                placeholder="Escribe un resumen de tu perfil profesional..."
                placeholderTextColor="#727785"
                value={resumen}
                onChangeText={v => { setResumen(v); scheduleSave(); }}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100 }}
              />
            </View>
            <View className="mt-3">
              <AiChip
  label={aiLoading === "resumen" ? "Mejorando..." : "Mejorar con IA"}
  variant="suggestion"
  onPress={async () => {
    if (aiLoading || !resumen.trim()) return;
    setAiLoading("resumen");
    try {
      const resp = await chatCompletion([
        {
          role: "system",
          content: "Eres un asesor profesional experto en currículums. Mejora el siguiente resumen profesional haciéndolo más impactante, con lenguaje activo y logros medibles. Responde SOLO con el texto mejorado, sin explicaciones ni introducciones. En español.",
        },
        { role: "user", content: resumen },
      ]);
      const mejorado = resp?.choices?.[0]?.message?.content;
      if (mejorado) setResumen(mejorado);
    } catch {
      Alert.alert("Error", "No se pudo mejorar el resumen");
    } finally {
      setAiLoading(null);
    }
  }}
/>
            </View>
          </View>

          {/* Experience */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <MaterialIcons name="work" size={20} color="#0b55cf" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Experiencia Laboral</Text>
            </View>
            <View style={{ gap: 24 }}>
              {experiencias.map((exp, i) => (
                <View key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm" style={{ gap: 20 }}>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-body-bold text-outline uppercase tracking-wider">Experiencia #{i + 1}</Text>
                    <Pressable onPress={() => removeExperiencia(i)}>
                      <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
                    </Pressable>
                  </View>
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <GhostInput label="Cargo / Puesto" placeholder="Ej: Senior Product Designer" value={exp.puesto} onChangeText={v => updateExperiencia(i, "puesto", v)} />
                    </View>
                    <View className="flex-1">
                      <GhostInput label="Empresa" placeholder="Ej: Tech Solutions Inc." value={exp.empresa} onChangeText={v => updateExperiencia(i, "empresa", v)} />
                    </View>
                  </View>
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <GhostInput label="Fechas" placeholder="Ene 2020 — Presente" value={exp.fechas} onChangeText={v => updateExperiencia(i, "fechas", v)} />
                    </View>
                    <View className="flex-1">
                      <GhostInput label="Ciudad" placeholder="Madrid, España" value={exp.ciudad} onChangeText={v => updateExperiencia(i, "ciudad", v)} />
                    </View>
                  </View>
                  <View>
                    <Text className="text-xs font-body-bold text-outline uppercase tracking-wider mb-2">Logros</Text>
                    {exp.logros.map((logro, li) => (
                      <View key={li} className="flex-row items-center gap-2 mb-2">
                        <Text className="text-primary">•</Text>
                        <TextInput
                          className="flex-1 text-on-surface font-body text-base border-b-2 border-outline-variant/20 pb-2"
                          placeholder={li === 0 ? "Describe tu logro principal..." : "Otro logro..."}
                          placeholderTextColor="#727785"
                          value={logro}
                          onChangeText={v => updateLogro(i, li, v)}
                          multiline
                        />
                        {exp.logros.length > 1 && (
                          <Pressable onPress={() => removeLogro(i, li)}>
                            <MaterialIcons name="close" size={16} color="#ba1a1a" />
                          </Pressable>
                        )}
                      </View>
                    ))}
                    <Pressable onPress={() => addLogro(i)} className="mt-1">
                      <Text className="text-primary text-xs font-body-bold">+ Añadir logro</Text>
                    </Pressable>
                  </View>
                  {/* AI Tooltip (inline para mobile) */}
                  <View className="bg-secondary-container p-3 rounded-lg flex-row items-start gap-2">
                    <MaterialIcons name="auto-awesome" size={14} color="#0b55cf" style={{ marginTop: 2 }} />
                    <Text className="text-xs text-on-secondary-container flex-1">
                      <Text className="font-bold">IA: </Text>
                      Describe tus logros con datos numéricos para destacar más.
                    </Text>
                  </View>
                </View>
              ))}
              {experiencias.length < 10 && (
                <Pressable onPress={addExperiencia}>
                  <View className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed border-outline-variant/30 rounded-xl">
                    <Text className="text-primary font-headline-semibold text-lg">+</Text>
                    <Text className="text-primary font-body-bold">Añadir otra experiencia</Text>
                  </View>
                </Pressable>
              )}
            </View>
          </View>

          {/* Education */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-tertiary/10 items-center justify-center">
                <MaterialIcons name="school" size={20} color="#1a6c23" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Educación</Text>
            </View>
            <View style={{ gap: 24 }}>
              {educacion.map((edu, i) => (
                <View key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm" style={{ gap: 20 }}>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-body-bold text-outline uppercase tracking-wider">Educación #{i + 1}</Text>
                    <Pressable onPress={() => removeEducacion(i)}>
                      <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
                    </Pressable>
                  </View>
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <GhostInput label="Título / Carrera" placeholder="Ej: Maestría en Arquitectura" value={edu.titulo} onChangeText={v => updateEducacion(i, "titulo", v)} />
                    </View>
                    <View className="flex-1">
                      <GhostInput label="Institución" placeholder="Ej: Universidad Nacional" value={edu.institucion} onChangeText={v => updateEducacion(i, "institucion", v)} />
                    </View>
                  </View>
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <GhostInput label="Fechas" placeholder="2018 — 2022" value={edu.fechas} onChangeText={v => updateEducacion(i, "fechas", v)} />
                    </View>
                    <View className="flex-1">
                      <GhostInput label="Ciudad" placeholder="Bogotá, Colombia" value={edu.ciudad} onChangeText={v => updateEducacion(i, "ciudad", v)} />
                    </View>
                  </View>
                </View>
              ))}
              {educacion.length < 10 && (
                <Pressable onPress={addEducacion}>
                  <View className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed border-outline-variant/30 rounded-xl">
                    <Text className="text-primary font-headline-semibold text-lg">+</Text>
                    <Text className="text-primary font-body-bold">Añadir otra educación</Text>
                  </View>
                </Pressable>
              )}
            </View>
            {/* AI Suggestion Chips */}
            <View className="mt-6">
              <Text className="text-xs font-body-bold text-outline uppercase tracking-wider mb-3">Sugerencias inteligentes:</Text>
              <View className="flex-row flex-wrap gap-2">
                <AiChip
  label={aiLoading === "honores" ? "Añadiendo..." : "Incluir honores académicos"}
  variant="suggestion"
  onPress={() => {
    if (educacion.length >= 10) return;
    setEducacion([...educacion, {
      titulo: "Honores Académicos",
      institucion: "Universidad",
      fechas: "2024",
      ciudad: "",
    }]);
    scheduleSave();
  }}
/>
<AiChip
  label={aiLoading === "proyectos" ? "Generando..." : "Añadir proyectos relevantes"}
  variant="suggestion"
  onPress={async () => {
    if (aiLoading) return;
    setAiLoading("proyectos");
    try {
      const carreras = educacion.map(e => e.titulo).filter(Boolean).join(", ") || "tu carrera";
      const resp = await chatCompletion([
        {
          role: "system",
          content: "Eres un asesor profesional. Dada una carrera o área de estudio, sugiere 3 proyectos relevantes que un candidato podría incluir en su CV para destacar. Responde SOLO con una lista en formato: '- Nombre del proyecto: breve descripción'. En español.",
        },
        { role: "user", content: `Mi formación es en: ${carreras}. Sugiere proyectos relevantes.` },
      ]);
      const sugerencia = resp?.choices?.[0]?.message?.content;
      if (sugerencia && experiencias.length < 10) {
        setExperiencias([...experiencias, {
          puesto: "Proyecto Relevante",
          empresa: "",
          fechas: "",
          ciudad: "",
          logros: sugerencia.split("\n").filter(l => l.trim()),
        }]);
        scheduleSave();
      }
    } catch {
      Alert.alert("Error", "No se pudieron generar sugerencias");
    } finally {
      setAiLoading(null);
    }
  }}
/>
              </View>
            </View>
          </View>

          {/* Skills */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <MaterialIcons name="stars" size={20} color="#0b55cf" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Habilidades</Text>
            </View>
            <View className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm" style={{ gap: 16 }}>
              <View className="flex-row flex-wrap gap-2">
                {habilidades.map(skill => (
                  <Pressable key={skill} onPress={() => removeHabilidad(skill)}>
                    <View className="bg-secondary-container px-3 py-1.5 rounded-full flex-row items-center gap-1">
                      <Text className="text-xs font-body-bold text-secondary">{skill}</Text>
                      <MaterialIcons name="close" size={14} color="#525f73" />
                    </View>
                  </Pressable>
                ))}
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 text-on-surface font-body border-b-2 border-outline-variant/20 py-2"
                  placeholder="Escribe una habilidad y presiona +"
                  placeholderTextColor="#727785"
                  value={habilidadInput}
                  onChangeText={setHabilidadInput}
                  onSubmitEditing={addHabilidad}
                />
                <Pressable onPress={addHabilidad} className="w-10 h-10 bg-primary rounded-xl items-center justify-center">
                  <Text className="text-on-primary font-bold">+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Languages */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <MaterialIcons name="language" size={20} color="#0b55cf" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Idiomas</Text>
            </View>
            <View style={{ gap: 16 }}>
              {idiomas.map((idi, i) => (
                <View key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm" style={{ gap: 16 }}>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-body-bold text-outline uppercase tracking-wider">Idioma #{i + 1}</Text>
                    <Pressable onPress={() => removeIdioma(i)}>
                      <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
                    </Pressable>
                  </View>
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <GhostInput label="Idioma" placeholder="Ej: Inglés" value={idi.nombre} onChangeText={v => updateIdioma(i, "nombre", v)} />
                    </View>
                    <View className="flex-1">
                      <GhostInput label="Nivel" placeholder="Avanzado (C1)" value={idi.nivel} onChangeText={v => updateIdioma(i, "nivel", v)} />
                    </View>
                  </View>
                </View>
              ))}
              <Pressable onPress={addIdioma}>
                <View className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed border-outline-variant/30 rounded-xl">
                  <Text className="text-primary font-headline-semibold text-lg">+</Text>
                  <Text className="text-primary font-body-bold">Añadir idioma</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Certifications */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <MaterialIcons name="verified" size={20} color="#0b55cf" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Certificaciones</Text>
            </View>
            <View style={{ gap: 16 }}>
              {certificaciones.map((cert, i) => (
                <View key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm" style={{ gap: 16 }}>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-body-bold text-outline uppercase tracking-wider">Certificación #{i + 1}</Text>
                    <Pressable onPress={() => removeCertificacion(i)}>
                      <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
                    </Pressable>
                  </View>
                  <GhostInput label="Nombre" placeholder="Ej: LEED AP" value={cert.nombre} onChangeText={v => updateCertificacion(i, "nombre", v)} />
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <GhostInput label="Institución" placeholder="Entidad emisora" value={cert.institucion} onChangeText={v => updateCertificacion(i, "institucion", v)} />
                    </View>
                    <View className="flex-1">
                      <GhostInput label="Fecha" placeholder="2023" value={cert.fechas} onChangeText={v => updateCertificacion(i, "fechas", v)} />
                    </View>
                  </View>
                </View>
              ))}
              <Pressable onPress={addCertificacion}>
                <View className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed border-outline-variant/30 rounded-xl">
                  <Text className="text-primary font-headline-semibold text-lg">+</Text>
                  <Text className="text-primary font-body-bold">Añadir certificación</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Interests */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <MaterialIcons name="favorite" size={20} color="#0b55cf" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Intereses</Text>
            </View>
            <View className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm" style={{ gap: 16 }}>
              <View className="flex-row flex-wrap gap-2">
                {intereses.map(item => (
                  <Pressable key={item} onPress={() => removeInteres(item)}>
                    <View className="bg-secondary-container px-3 py-1.5 rounded-full flex-row items-center gap-1">
                      <Text className="text-xs font-body-bold text-secondary">{item}</Text>
                      <MaterialIcons name="close" size={14} color="#525f73" />
                    </View>
                  </Pressable>
                ))}
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 text-on-surface font-body border-b-2 border-outline-variant/20 py-2"
                  placeholder="Ej: Derechos Humanos, Documentales"
                  placeholderTextColor="#727785"
                  value={interesInput}
                  onChangeText={setInteresInput}
                  onSubmitEditing={addInteres}
                />
                <Pressable onPress={addInteres} className="w-10 h-10 bg-primary rounded-xl items-center justify-center">
                  <Text className="text-on-primary font-bold">+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row justify-between items-center mb-12">
            <Pressable onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Text className="text-primary font-body-bold">
                {saveMutation.isPending ? "Guardando..." : "Guardar borrador"}
              </Text>
            </Pressable>
            <Pressable onPress={handlePreview} disabled={pdfLoading || saveMutation.isPending}>
              <LinearGradient
                colors={["#0b55cf", "#3870ea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-10 py-4 rounded-xl"
                style={{ opacity: pdfLoading || saveMutation.isPending ? 0.6 : 1 }}
              >
                {pdfLoading ? (
                  <Text className="text-white font-headline-semibold">Generando PDF...</Text>
                ) : (
                  <Text className="text-white font-headline-semibold">Vista Previa</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}