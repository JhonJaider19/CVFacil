import { useAuth } from "@/src/lib/auth-context";
import { createResume, getResumes, updateResume } from "@/src/lib/api";
import { generateCvScore } from "@/src/lib/ai-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GlassHeader from "@/components/GlassHeader";
import GhostInput from "@/components/GhostInput";
import AiChip from "@/components/AiChip";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { ResumeData, Experience, Education } from "@/src/lib/types";

const emptyExperience: Experience = { position: "", company: "", startDate: "", endDate: "", description: "" };
const emptyEducation: Education = { degree: "", institution: "", startDate: "", endDate: "" };

export default function EditorScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: resumes } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: () => getResumes(user!.id),
    enabled: !!user,
  });

  const currentResume = resumes?.[0];
  const initialData = currentResume?.data ?? {};

  const [fullName, setFullName] = useState(initialData.fullName ?? "");
  const [email, setEmail] = useState(initialData.email ?? "");
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [location, setLocation] = useState(initialData.location ?? "");
  const [title, setTitle] = useState(initialData.title ?? "");
  const [summary, setSummary] = useState(initialData.summary ?? "");
  const [experiences, setExperiences] = useState<Experience[]>(
    initialData.experience?.length ? initialData.experience : [emptyExperience],
  );
  const [education, setEducation] = useState<Education[]>(
    initialData.education?.length ? initialData.education : [emptyEducation],
  );
  const [skills, setSkills] = useState<string[]>(initialData.skills ?? []);
  const [skillInput, setSkillInput] = useState("");

  const [showDatePicker, setShowDatePicker] = useState<{ type: "exp" | "edu"; index: number; field: "startDate" | "endDate" } | null>(null);

  useEffect(() => {
    if (!currentResume) return;
    const d = currentResume.data;
    setFullName(d.fullName ?? fullName);
    setEmail(d.email ?? email);
    setPhone(d.phone ?? phone);
    setLocation(d.location ?? location);
    setTitle(d.title ?? title);
    setSummary(d.summary ?? summary);
    if (d.experience?.length) setExperiences(d.experience);
    if (d.education?.length) setEducation(d.education);
    if (d.skills?.length) setSkills(d.skills);
  }, [currentResume?.id]);

  const buildData = useCallback((): ResumeData => ({
    fullName, email, phone, location, title, summary,
    experience: experiences.filter(e => e.position || e.company),
    education: education.filter(e => e.degree || e.institution),
    skills,
  }), [fullName, email, phone, location, title, summary, experiences, education, skills]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const data = buildData();
      const score = await generateCvScore(data);
      if (!currentResume) {
        return createResume(user.id, "Mi CV");
      }
      return updateResume(currentResume.id, { data, score });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", user?.id] });
    },
  });

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveMutation.mutate(), 2000);
  }, [saveMutation]);

  function addExperience() {
    if (experiences.length >= 5) return;
    setExperiences([...experiences, { ...emptyExperience }]);
  }

  function removeExperience(index: number) {
    if (experiences.length <= 1) return;
    setExperiences(experiences.filter((_, i) => i !== index));
  }

  function updateExperience(index: number, field: keyof Experience, value: string) {
    const updated = experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp,
    );
    setExperiences(updated);
    scheduleSave();
  }

  function addEducation() {
    if (education.length >= 5) return;
    setEducation([...education, { ...emptyEducation }]);
  }

  function removeEducation(index: number) {
    if (education.length <= 1) return;
    setEducation(education.filter((_, i) => i !== index));
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    const updated = education.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu,
    );
    setEducation(updated);
    scheduleSave();
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills([...skills, trimmed]);
    setSkillInput("");
    scheduleSave();
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter(s => s !== skill));
    scheduleSave();
  }

  function handleDateChange(type: "exp" | "edu", index: number, field: "startDate" | "endDate", _event: any, selectedDate?: Date) {
    setShowDatePicker(null);
    if (!selectedDate) return;
    const formatted = selectedDate.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
    if (type === "exp") updateExperience(index, field, formatted);
    else updateEducation(index, field, formatted);
  }

  const score = currentResume?.score ?? 0;

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
        contentContainerStyle={{ paddingTop: 96, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6">
          {/* Progress */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-3">
              <Text className="font-headline text-2xl tracking-tight text-on-surface">
                Tu CV
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
            <View className="bg-surface-container-lowest p-6 rounded-xl" style={{ gap: 20 }}>
              <GhostInput label="Nombre Completo" placeholder="Tu nombre" value={fullName} onChangeText={v => { setFullName(v); scheduleSave(); }} />
              <GhostInput label="Correo Electrónico" placeholder="email@ejemplo.com" value={email} onChangeText={v => { setEmail(v); scheduleSave(); }} keyboardType="email-address" />
              <GhostInput label="Teléfono" placeholder="+34 600 000 000" value={phone} onChangeText={v => { setPhone(v); scheduleSave(); }} keyboardType="phone-pad" />
              <GhostInput label="Ubicación" placeholder="Madrid, España" value={location} onChangeText={v => { setLocation(v); scheduleSave(); }} />
              <GhostInput label="Título Profesional" placeholder="Product Designer & Strategist" value={title} onChangeText={v => { setTitle(v); scheduleSave(); }} />
            </View>
          </View>

          {/* Summary */}
          <View className="mb-12">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <MaterialIcons name="article" size={20} color="#0b55cf" />
              </View>
              <Text className="font-headline text-xl text-on-surface">Resumen Profesional</Text>
            </View>
            <View className="bg-surface-container-lowest p-6 rounded-xl">
              <TextInput
                className="text-on-surface font-body text-base leading-relaxed"
                placeholder="Escribe un resumen de tu perfil profesional..."
                placeholderTextColor="#727785"
                value={summary}
                onChangeText={v => { setSummary(v); scheduleSave(); }}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100 }}
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
              {experiences.map((exp, i) => (
                <View key={i} className="bg-surface-container-lowest p-6 rounded-xl" style={{ gap: 20 }}>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-body-bold text-outline uppercase tracking-wider">Experiencia #{i + 1}</Text>
                    {experiences.length > 1 && (
                      <Pressable onPress={() => removeExperience(i)}>
                        <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
                      </Pressable>
                    )}
                  </View>
                  <GhostInput label="Cargo / Puesto" placeholder="Ej: Senior Product Designer" value={exp.position} onChangeText={v => updateExperience(i, "position", v)} />
                  <GhostInput label="Empresa" placeholder="Ej: Tech Solutions Inc." value={exp.company} onChangeText={v => updateExperience(i, "company", v)} />
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-xs font-body-bold text-outline uppercase tracking-wider mb-2">Fecha Inicio</Text>
                      <Pressable
                        onPress={() => setShowDatePicker({ type: "exp", index: i, field: "startDate" })}
                        className="border-b-2 border-outline-variant/20 py-3"
                      >
                        <Text className={`font-body ${exp.startDate ? "text-on-surface" : "text-outline"}`}>
                          {exp.startDate || "Seleccionar fecha"}
                        </Text>
                      </Pressable>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-body-bold text-outline uppercase tracking-wider mb-2">Fecha Fin</Text>
                      <Pressable
                        onPress={() => setShowDatePicker({ type: "exp", index: i, field: "endDate" })}
                        className="border-b-2 border-outline-variant/20 py-3"
                      >
                        <Text className={`font-body ${exp.endDate ? "text-on-surface" : "text-outline"}`}>
                          {exp.endDate || "Seleccionar fecha"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <View>
                    <Text className="text-xs font-body-bold text-outline uppercase tracking-wider mb-2">Descripción</Text>
                    <TextInput
                      className="text-on-surface font-body text-base border-b-2 border-outline-variant/20 pb-3"
                      placeholder="Describe tus responsabilidades y logros..."
                      placeholderTextColor="#727785"
                      value={exp.description}
                      onChangeText={v => updateExperience(i, "description", v)}
                      multiline
                      numberOfLines={3}
                      style={{ minHeight: 80 }}
                    />
                  </View>
                </View>
              ))}
              {experiences.length < 5 && (
                <Pressable onPress={addExperience}>
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
              {education.map((edu, i) => (
                <View key={i} className="bg-surface-container-lowest p-6 rounded-xl" style={{ gap: 20 }}>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-body-bold text-outline uppercase tracking-wider">Educación #{i + 1}</Text>
                    {education.length > 1 && (
                      <Pressable onPress={() => removeEducation(i)}>
                        <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
                      </Pressable>
                    )}
                  </View>
                  <GhostInput label="Título / Carrera" placeholder="Ej: Licenciatura en Marketing" value={edu.degree} onChangeText={v => updateEducation(i, "degree", v)} />
                  <GhostInput label="Institución" placeholder="Ej: Universidad Nacional" value={edu.institution} onChangeText={v => updateEducation(i, "institution", v)} />
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-xs font-body-bold text-outline uppercase tracking-wider mb-2">Fecha Inicio</Text>
                      <Pressable
                        onPress={() => setShowDatePicker({ type: "edu", index: i, field: "startDate" })}
                        className="border-b-2 border-outline-variant/20 py-3"
                      >
                        <Text className={`font-body ${edu.startDate ? "text-on-surface" : "text-outline"}`}>
                          {edu.startDate || "Seleccionar fecha"}
                        </Text>
                      </Pressable>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-body-bold text-outline uppercase tracking-wider mb-2">Fecha Fin</Text>
                      <Pressable
                        onPress={() => setShowDatePicker({ type: "edu", index: i, field: "endDate" })}
                        className="border-b-2 border-outline-variant/20 py-3"
                      >
                        <Text className={`font-body ${edu.endDate ? "text-on-surface" : "text-outline"}`}>
                          {edu.endDate || "Seleccionar fecha"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
              {education.length < 5 && (
                <Pressable onPress={addEducation}>
                  <View className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed border-outline-variant/30 rounded-xl">
                    <Text className="text-primary font-headline-semibold text-lg">+</Text>
                    <Text className="text-primary font-body-bold">Añadir otra educación</Text>
                  </View>
                </Pressable>
              )}
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
            <View className="bg-surface-container-lowest p-6 rounded-xl" style={{ gap: 16 }}>
              <View className="flex-row flex-wrap gap-2">
                {skills.map(skill => (
                  <Pressable key={skill} onPress={() => removeSkill(skill)}>
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
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onSubmitEditing={addSkill}
                />
                <Pressable onPress={addSkill} className="w-10 h-10 bg-primary rounded-xl items-center justify-center">
                  <Text className="text-on-primary font-bold">+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* AI Suggestions */}
          <View className="mb-12">
            <View className="bg-secondary-container p-4 rounded-xl flex-row items-start gap-3">
              <MaterialIcons name="auto-awesome" size={18} color="#0b55cf" style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-xs font-body-bold text-secondary uppercase tracking-wider mb-1">Consejo de IA</Text>
                <Text className="text-xs font-body text-on-secondary-container leading-relaxed">
                  Describe tus logros con datos numéricos para destacar más.
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-3">
              <AiChip label="Añadir métricas" variant="suggestion" />
              <AiChip label="Mejorar resumen" variant="suggestion" />
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row justify-between items-center">
            <Pressable onPress={() => saveMutation.mutate()}>
              <Text className="text-primary font-body-bold">
                {saveMutation.isPending ? "Guardando..." : "Guardar borrador"}
              </Text>
            </Pressable>
            <Pressable onPress={() => saveMutation.mutate()}>
              <LinearGradient
                colors={["#0b55cf", "#3870ea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-10 py-4 rounded-xl"
              >
                <Text className="text-white font-headline-semibold">Siguiente paso →</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => handleDateChange(showDatePicker.type, showDatePicker.index, showDatePicker.field, event, date)}
        />
      )}
    </View>
  );
}
