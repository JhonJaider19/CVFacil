import GlassHeader from "@/components/GlassHeader";
import {
  chatCompletion,
  generateCvSuggestion,
  generateInterviewQuestion,
} from "@/src/lib/ai-service";
import {
  completeInterview,
  createInterview,
  getResumes,
  saveInterviewMessage,
} from "@/src/lib/api";
import { useCurrentUserId } from "@/src/lib/use-current-user";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { STATUS_BAR_HEIGHT } from "@/src/lib/status-bar";

const quickActions = [
  {
    id: "interview",
    icon: "track-changes" as const,
    title: "Simular Entrevista",
    desc: "Practica con IA en tiempo real",
    gradient: ["#0b55cf", "#3870ea"] as const,
  },
  {
    id: "improve",
    icon: "auto-awesome" as const,
    title: "Mejorar CV",
    desc: "Optimiza secciones con IA",
    gradient: ["#1a6c23", "#37863a"] as const,
  },
  {
    id: "tips",
    icon: "lightbulb" as const,
    title: "Consejos",
    desc: "Tips para destacar",
    gradient: ["#525f73", "#bac7de"] as const,
  },
];

interface ChatMessage {
  id: string;
  type: "ai" | "user";
  text: string;
  time: string;
}

export default function AssistantScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      text: "¡Hola! Soy tu asistente profesional con IA. Puedo ayudarte a practicar entrevistas, mejorar tu CV o darte consejos para destacar. ¿Por dónde quieres empezar?",
      time: "Ahora",
    },
  ]);
  const [showInterview, setShowInterview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const { data: resumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => getResumes(),
  });

  const currentResume = resumes?.[0];

  async function handleSend(content?: string) {
    const text = (content || input).trim();
    if (!text || aiLoading) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      text,
      time: "Enviado",
    };
    setMessages((prev) => [...prev, userMsg]);
    setAiLoading(true);

    try {
      const response = await chatCompletion([
        {
          role: "system",
          content:
            "Eres un asistente profesional experto en CVs, entrevistas de trabajo y desarrollo de carrera. Respondes en español de forma clara y útil.",
        },
        ...messages.map((m) => ({
          role: m.type === "ai" ? ("assistant" as const) : ("user" as const),
          content: m.text,
        })),
        { role: "user" as const, content: text },
      ]);
      const reply =
        response?.choices?.[0]?.message?.content ||
        "Lo siento, no pude procesar tu solicitud.";
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        text: reply,
        time: "Ahora",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        text: `Error: ${e.message}`,
        time: "Ahora",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleQuickAction(actionId: string) {
    switch (actionId) {
      case "interview":
        setShowInterview(true);
        break;
      case "improve":
        if (!currentResume) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "ai",
              text: "Primero necesitas crear un CV en el Editor para que pueda analizarlo y sugerir mejoras.",
              time: "Ahora",
            },
          ]);
          return;
        }
        setAiLoading(true);
        try {
          const suggestion = await generateCvSuggestion(currentResume.data);
          const reply =
            suggestion?.choices?.[0]?.message?.content ||
            "No pude analizar tu CV.";
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "ai",
              text: reply,
              time: "Ahora",
            },
          ]);
        } catch (e: any) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "ai",
              text: `Error: ${e.message}`,
              time: "Ahora",
            },
          ]);
        } finally {
          setAiLoading(false);
        }
        break;
      case "tips":
        setAiLoading(true);
        try {
          const tips = await chatCompletion([
            {
              role: "system",
              content:
                "Eres un coach profesional. Da 3 consejos prácticos y específicos para que un candidato destaque en su búsqueda de trabajo. Responde en español.",
            },
            {
              role: "user",
              content:
                "Dame consejos para mejorar mi perfil profesional y encontrar mejores oportunidades laborales.",
            },
          ]);
          const reply =
            tips?.choices?.[0]?.message?.content || "No pude obtener consejos.";
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "ai",
              text: reply,
              time: "Ahora",
            },
          ]);
        } catch (e: any) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "ai",
              text: `Error: ${e.message}`,
              time: "Ahora",
            },
          ]);
        } finally {
          setAiLoading(false);
        }
        break;
    }
  }

  if (showInterview) {
    return (
      <InterviewMode
        onBack={() => setShowInterview(false)}
        resumeData={currentResume?.data}
        resumeId={currentResume?.id}
      />
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <GlassHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={STATUS_BAR_HEIGHT}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 64 + STATUS_BAR_HEIGHT, paddingBottom: 200 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-6xl mx-auto px-6">
            <Text className="font-headline text-3xl text-on-surface tracking-tight mb-2">
              Asistente IA
            </Text>
            <Text className="text-on-surface-variant font-body text-lg mb-8">
              Tu coach profesional con inteligencia artificial
            </Text>

            <View className="flex-row flex-wrap gap-4 mb-10">
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  className="w-full sm:flex-1 min-w-[280px]"
                  onPress={() => handleQuickAction(action.id)}
                >
                  <LinearGradient
                    colors={action.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-6 rounded-xl flex-row items-center gap-4"
                  >
                    <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                      <MaterialIcons
                        name={action.icon}
                        size={24}
                        color="#ffffff"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-headline text-lg">
                        {action.title}
                      </Text>
                      <Text className="text-white/80 font-body text-sm">
                        {action.desc}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="rgba(255,255,255,0.6)"
                    />
                  </LinearGradient>
                </Pressable>
              ))}
            </View>

            <View className="mb-6">
              <View className="flex-row items-center gap-3 mb-6">
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <MaterialIcons name="chat" size={20} color="#0b55cf" />
                </View>
                <Text className="font-headline text-xl text-on-surface">
                  Conversación
                </Text>
              </View>

              {messages.map((msg) => (
                <View key={msg.id} className="flex-row gap-3 mb-6">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${msg.type === "ai" ? "bg-primary-container" : "bg-secondary-container"}`}
                  >
                    {msg.type === "ai" ? (
                      <MaterialIcons name="smart-toy" size={20} color="#ffffff" />
                    ) : (
                      <MaterialIcons name="person" size={20} color="#ffffff" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View
                      className={`p-4 rounded-2xl ${msg.type === "ai" ? "bg-white rounded-tl-none" : "bg-primary/5 rounded-tr-none"}`}
                    >
                      <Text className="text-on-surface font-body leading-relaxed">
                        {msg.text}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-outline font-body-medium px-1 mt-1">
                      {msg.type === "ai" ? "Asistente IA" : "Tú"} • {msg.time}
                    </Text>
                  </View>
                </View>
              ))}

              {aiLoading && (
                <View className="flex-row items-center gap-3 mb-6">
                  <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center">
                    <MaterialIcons name="smart-toy" size={20} color="#ffffff" />
                  </View>
                  <View className="bg-white p-4 rounded-2xl rounded-tl-none">
                    <ActivityIndicator size="small" color="#0b55cf" />
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Input fijo al fondo de la pantalla (fuera del KAV) */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pb-4 bg-surface"
        style={{
          borderTopWidth: 1,
          borderTopColor: "rgba(193, 198, 214, 0.2)",
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        }}
      >
        <View className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10">
          <TextInput
            className="text-on-surface font-body text-base min-h-[56px] border-b-2 pb-3"
            placeholder="Escribe tu mensaje aquí..."
            placeholderTextColor="#727785"
            value={input}
            onChangeText={setInput}
            multiline
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            style={{
              borderColor: isInputFocused
                ? "#0b55cf"
                : "rgba(193, 198, 214, 0.2)",
            }}
            onSubmitEditing={() => handleSend()}
          />
          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row gap-2">
              <Pressable
                className="bg-secondary-container px-3 py-1.5 rounded-xl"
                onPress={() => handleQuickAction("improve")}
              >
                <Text className="text-[11px] font-body-bold text-secondary">
                  Mejorar CV
                </Text>
              </Pressable>
              <Pressable
                className="bg-secondary-container px-3 py-1.5 rounded-xl"
                onPress={() => handleQuickAction("tips")}
              >
                <Text className="text-[11px] font-body-bold text-secondary">
                  Preparar entrevista
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => handleSend()}
              disabled={aiLoading}
              hitSlop={20}
              style={{ opacity: aiLoading ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={["#0b55cf", "#3870ea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-12 h-12 rounded-xl items-center justify-center shadow-md shadow-primary/20 active:scale-95 transition-all"
              >
                <MaterialIcons name="send" size={18} color="#ffffff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function InterviewMode({
  onBack,
  resumeData,
  resumeId,
}: {
  onBack: () => void;
  resumeData: any;
  resumeId?: string;
}) {
  const getUserId = useCurrentUserId();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [isInterviewInputFocused, setIsInterviewInputFocused] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [interviewMessages, setInterviewMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [bootstrapping, setBootstrapping] = useState(true);
  const timerRef = useRef<any>(null);
  const transcriptRef = useRef<{ role: "ai" | "user"; content: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const userId = await getUserId();
      if (cancelled) return;
      if (!userId) {
        setInterviewMessages([
          {
            id: "auth-err",
            type: "ai",
            text: "No hay sesión activa. Cierra y vuelve a iniciar sesión para usar el simulador.",
            time: "Ahora",
          },
        ]);
        setBootstrapping(false);
        return;
      }
      try {
        const interview = await createInterview({ userId, resumeId });
        if (cancelled) return;
        setInterviewId(interview.id);

        const intro =
          "Bienvenido a la simulación de entrevista. Voy a hacerte preguntas como un reclutador real. Responde con naturalidad. Cuéntame, ¿por qué decidiste postularte a esta posición?";
        const aiMsg: ChatMessage = {
          id: "init",
          type: "ai",
          text: intro,
          time: "Ahora",
        };
        setInterviewMessages([aiMsg]);
        transcriptRef.current = [{ role: "ai", content: intro }];
        await saveInterviewMessage(interview.id, "ai", intro);
      } catch (e: any) {
        if (cancelled) return;
        Alert.alert(
          "No se pudo iniciar la entrevista",
          e?.message || "Verifica tu conexión e inténtalo de nuevo.",
        );
        setInterviewMessages([
          {
            id: "err",
            type: "ai",
            text: `Error iniciando entrevista: ${e.message}`,
            time: "Ahora",
          },
        ]);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getUserId, resumeId]);

  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  async function handleSendInterview() {
    const text = input.trim();
    if (!text || loading || !interviewId) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      text,
      time: "Enviado",
    };
    setInterviewMessages((prev) => [...prev, userMsg]);
    transcriptRef.current.push({ role: "user", content: text });
    setLoading(true);

    if (!timerRef.current) startTimer();

    try {
      const response = await generateInterviewQuestion(text);
      const reply =
        response?.choices?.[0]?.message?.content ||
        "Gracias por tu respuesta. Cuéntame más sobre tu experiencia.";

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        text: reply,
        time: "Ahora",
      };
      setInterviewMessages((prev) => [...prev, aiMsg]);
      transcriptRef.current.push({ role: "ai", content: reply });

      await Promise.all([
        saveInterviewMessage(interviewId, "user", text),
        saveInterviewMessage(interviewId, "ai", reply),
      ]);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        text: `Error: ${e.message}`,
        time: "Ahora",
      };
      setInterviewMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);

    try {
      const formattedTimer = formatTime(timer);
      const questionCount = Math.max(
        0,
        transcriptRef.current.filter((m) => m.role === "ai").length - 1,
      );
      const transcriptText = transcriptRef.current
        .map((m) => `${m.role === "ai" ? "Reclutador" : "Candidato"}: ${m.content}`)
        .join("\n");
      const summaryPrompt = `La entrevista duró ${formattedTimer} y se hicieron ${questionCount} preguntas. Transcripción completa:\n${transcriptText}\n\nDevuelve PRIMERO una línea con el formato exacto "SCORE: X" donde X es una puntuación entera de 0 a 100 que refleje el desempeño general del candidato (comunicación, profundidad técnica, uso de ejemplos, claridad). Después del SCORE, escribe en español el feedback profesional detallado con: fortalezas mostradas, áreas de mejora, puntuación final y recomendaciones.`;

      const response = await chatCompletion([
        {
          role: "system",
          content:
            "Eres un reclutador senior dando feedback post-entrevista. Sé constructivo, específico y profesional.",
        },
        { role: "user", content: summaryPrompt },
      ]);
      const raw =
        response?.choices?.[0]?.message?.content ||
        "Gracias por participar en la simulación.";

      const scoreMatch = raw.match(/SCORE:\s*(\d{1,3})/i);
      const finalScore = scoreMatch
        ? Math.max(0, Math.min(100, parseInt(scoreMatch[1], 10)))
        : 0;
      const feedbackText = raw.replace(/SCORE:\s*\d{1,3}\s*\n?/i, "").trim();

      setScore(finalScore);

      if (interviewId) {
        try {
          await completeInterview({
            interviewId,
            score: finalScore,
            durationSeconds: timer,
          });
          await saveInterviewMessage(
            interviewId,
            "ai",
            `## Feedback Final\n\n${feedbackText}`,
          );
          queryClient.invalidateQueries({
            queryKey: ["latest-interview"],
          });
        } catch (persistErr: any) {
          // Non-fatal: show feedback anyway
          console.warn("No se pudo persistir el resultado:", persistErr);
        }
      }

      setInterviewMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          text: `## Feedback Final\n\n${feedbackText}`,
          time: "Ahora",
        },
      ]);
    } catch (e: any) {
      setInterviewMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          text: `Error generando feedback: ${e.message}`,
          time: "Ahora",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <View
        className="absolute top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl"
        style={{ paddingTop: STATUS_BAR_HEIGHT }}
      >
        <View className="flex-row items-center justify-between px-6 h-16 border-b border-outline-variant/10">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={onBack}
              className="p-1 hover:bg-surface-container-low rounded-lg"
            >
              <MaterialIcons name="arrow-back" size={24} color="#525f73" />
            </Pressable>
            <Text className="text-xl font-display tracking-tight text-primary">
              CVFácil
            </Text>
          </View>
          <View className="flex-row items-center gap-2 bg-secondary-container/50 px-3 py-1 rounded-full border border-outline-variant/10">
            <MaterialIcons name="track-changes" size={16} color="#0b55cf" />
            <Text className="text-xs font-headline text-primary uppercase tracking-wider">
              Simulador IA
            </Text>
          </View>
        </View>
      </View>

<KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={STATUS_BAR_HEIGHT}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 64 + STATUS_BAR_HEIGHT, paddingBottom: 200 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-6xl mx-auto px-6">
            <View className="flex-row justify-between mb-8">
              <View className="flex-1 bg-surface-container-lowest p-4 rounded-xl mr-2 border border-outline-variant/10">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialIcons name="trending-up" size={16} color="#525f73" />
                  <Text className="text-[10px] font-body-bold text-on-surface-variant uppercase tracking-wider">
                    Calificación
                  </Text>
                </View>
                <Text className="font-headline text-2xl text-on-surface">
                  {Math.round(score)}
                  <Text className="text-on-surface-variant font-body text-xs">
                    /100
                  </Text>
                </Text>
              </View>
              <View className="flex-1 bg-surface-container-lowest p-4 rounded-xl mr-2 border border-outline-variant/10">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialIcons name="timer" size={16} color="#525f73" />
                  <Text className="text-[10px] font-body-bold text-on-surface-variant uppercase tracking-wider">
                    Tiempo
                  </Text>
                </View>
                <Text className="font-headline text-2xl text-on-surface">
                  {formatTime(timer)}
                </Text>
              </View>
              <View className="flex-1 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialIcons
                    name="check-circle-outline"
                    size={16}
                    color="#525f73"
                  />
                  <Text className="text-[10px] font-body-bold text-on-surface-variant uppercase tracking-wider">
                    Preguntas
                  </Text>
                </View>
                <Text className="font-headline text-2xl text-primary">
                  {Math.max(0, interviewMessages.length - 1)}
                </Text>
              </View>
            </View>

            <View className="mb-6">
              {interviewMessages.map((msg) => (
                <View key={msg.id} className="flex-row gap-3 mb-6">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${msg.type === "ai" ? "bg-primary-container" : "bg-secondary-container"}`}
                  >
                    {msg.type === "ai" ? (
                      <MaterialIcons name="smart-toy" size={20} color="#ffffff" />
                    ) : (
                      <MaterialIcons name="person" size={20} color="#ffffff" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View
                      className={`p-4 rounded-2xl ${msg.type === "ai" ? "bg-white rounded-tl-none" : "bg-primary/5 rounded-tr-none"}`}
                    >
                      <Text className="text-on-surface font-body leading-relaxed">
                        {msg.text}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-outline font-body-medium px-1 mt-1">
                      {msg.type === "ai" ? "Reclutador IA" : "Tú"} • {msg.time}
                    </Text>
                  </View>
                </View>
              ))}

              {loading && (
                <View className="flex-row gap-3 mb-6 opacity-70">
                  <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center">
                    <MaterialIcons name="smart-toy" size={20} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <View className="bg-white p-4 rounded-2xl rounded-tl-none">
                      <Text className="text-on-surface font-body italic">
                        <ActivityIndicator size="small" color="#0b55cf" />{" "}
                        Analizando tu respuesta...
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <Pressable
              className="flex-row items-center justify-center gap-2 py-3 mb-4 hover:bg-surface-container-low rounded-lg transition-colors"
              onPress={() => {
                const helpMsg: ChatMessage = {
                  id: Date.now().toString(),
                  type: "ai",
                  text: "💡 **Consejo**: Usa el método STAR para estructurar tus respuestas:\n\n**S**ituación — Describe el contexto\n**T**area — Explica tu responsabilidad\n**A**cción — Detalla lo que hiciste\n**R**esultado — Muestra el impacto con datos\n\nEjemplo: \"En mi anterior trabajo (Situación), lideré la migración a la nube (Tarea), coordinando 5 equipos y rediseñando la arquitectura (Acción), logrando un 40% de reducción de costos (Resultado).\"",
                  time: "Ahora",
                };
                setInterviewMessages((prev) => [...prev, helpMsg]);
              }}
            >
              <MaterialIcons name="lightbulb" size={18} color="#0b55cf" />
              <Text className="text-primary font-body-bold text-sm">
                Ayuda de IA
              </Text>
            </Pressable>

            <View className="flex-row justify-center mb-4">
              <Pressable onPress={handleFinish} disabled={bootstrapping || !interviewId}>
                <LinearGradient
                  colors={["#ba1a1a", "#e03b3b"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="px-6 py-3 rounded-xl shadow-md shadow-error/20 active:scale-95 transition-all flex-row items-center gap-2"
                  style={{ opacity: bootstrapping || !interviewId ? 0.5 : 1 }}
                >
                  <MaterialIcons name="assessment" size={18} color="#ffffff" />
                  <Text className="text-white font-headline-semibold text-sm">
                    Finalizar y ver Feedback
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Input fijo al fondo (fuera del KAV) */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pb-4 bg-surface"
        style={{
          borderTopWidth: 1,
          borderTopColor: "rgba(193, 198, 214, 0.2)",
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <TextInput
              className="bg-surface-container-lowest text-on-surface font-body text-base rounded-xl px-4 py-4 border"
              placeholder={bootstrapping ? "Preparando entrevista..." : "Escribe tu respuesta..."}
              placeholderTextColor="#727785"
              value={input}
              onChangeText={setInput}
              multiline
              editable={!bootstrapping && !!interviewId}
              onFocus={() => setIsInterviewInputFocused(true)}
              onBlur={() => setIsInterviewInputFocused(false)}
              style={{
                borderColor: isInterviewInputFocused
                  ? "#0b55cf"
                  : "rgba(193, 198, 214, 0.2)",
              }}
              onSubmitEditing={handleSendInterview}
            />
          </View>
          <Pressable
            onPress={handleSendInterview}
            disabled={bootstrapping || !interviewId || loading}
            hitSlop={20}
            style={{ opacity: bootstrapping || !interviewId || loading ? 0.5 : 1 }}
          >
            <LinearGradient
              colors={["#0b55cf", "#3870ea"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-14 h-14 rounded-xl items-center justify-center shadow-md shadow-primary/20 active:scale-95 transition-all"
            >
              {bootstrapping ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <MaterialIcons name="arrow-upward" size={24} color="#ffffff" />
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
