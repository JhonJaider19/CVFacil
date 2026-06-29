import { insforge } from "./insforge";

const DEFAULT_MODEL = "openrouter/free";

export async function chatCompletion(messages: { role: string; content: string }[], model = DEFAULT_MODEL) {
  const { data, error } = await insforge.functions.invoke("ai-proxy", {
    body: { messages, model },
  });
  if (error) throw new Error(error.message);
  return data as { choices: Array<{ message: { content: string } }> };
}

export async function generateInterviewQuestion(context: string) {
  const messages = [
    {
      role: "system",
      content: "Eres un reclutador senior que realiza una entrevista de trabajo simulada. Haz preguntas relevantes, da seguimiento a las respuestas y evalúa al candidato. Responde en español de forma natural y profesional.",
    },
    { role: "user", content: context || "Inicia la entrevista preguntándome sobre mi experiencia profesional." },
  ];
  return chatCompletion(messages);
}

export async function generateCvSuggestion(resumeData: any) {
  const dataStr = JSON.stringify(resumeData, null, 2);
  const messages = [
    {
      role: "system",
      content: "Eres un asesor profesional experto en currículums. Analiza el CV proporcionado y sugiere mejoras concretas. Responde con sugerencias específicas y accionables en español.",
    },
    { role: "user", content: `Analiza este CV y sugiere mejoras:\n${dataStr}` },
  ];
  return chatCompletion(messages);
}

export async function generateCvScore(resumeData: any): Promise<number> {
  if (!resumeData) return 0;
  let score = 40;

  const nombre = resumeData.nombre || resumeData.nombreCompleto || "";
  const apellido = resumeData.apellido || "";
  const nombreCompleto = `${nombre} ${apellido}`.trim();

  if (nombreCompleto) score += 5;
  if (resumeData.correo || resumeData.email) score += 5;
  if (resumeData.telefono || resumeData.phone) score += 3;
  if (resumeData.ubicacion || resumeData.location) score += 2;
  if (resumeData.profesion || resumeData.title) score += 5;
  const summary = resumeData.resumen || resumeData.perfil || resumeData.summary || "";
  if (summary.length > 30) score += 10;

  const experiencias = resumeData.experiencias || resumeData.experience || [];
  const expCount = experiencias.filter((e: any) => e.puesto || e.position || e.empresa || e.company).length;
  score += Math.min(expCount * 5, 15);
  experiencias.forEach((exp: any) => {
    const logros = exp.logros || (exp.description ? [exp.description] : []);
    const logrosText = logros.filter(Boolean).join(" ");
    if (logrosText.length > 50) score += 3;
    if (exp.fechas || exp.startDate) score += 1;
    if (exp.endDate) score += 1;
  });

  const educacion = resumeData.educacion || resumeData.education || [];
  const eduCount = educacion.filter((e: any) => e.titulo || e.degree || e.institucion || e.institution).length;
  score += Math.min(eduCount * 5, 10);

  const skills = resumeData.habilidades || resumeData.skills || [];
  score += Math.min(skills.length * 2, 10);

  return Math.min(Math.max(score, 0), 100);
}
