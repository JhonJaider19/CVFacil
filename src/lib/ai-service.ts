import { insforge } from "./insforge";

const DEFAULT_MODEL = "gpt-4o-mini";
const INTERVIEW_MODEL = "claude-sonnet-4.5";

export async function chatCompletion(messages: { role: string; content: string }[], model = DEFAULT_MODEL) {
  const { data, error } = await insforge.ai.chat.completions.create({
    model,
    messages: messages as any,
    temperature: 0.7,
    maxTokens: 1024,
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
  return chatCompletion(messages, INTERVIEW_MODEL);
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
  if (resumeData.fullName) score += 5;
  if (resumeData.email) score += 5;
  if (resumeData.phone) score += 3;
  if (resumeData.location) score += 2;
  if (resumeData.title) score += 5;
  if (resumeData.summary && resumeData.summary.length > 30) score += 10;
  const expCount = (resumeData.experience || []).filter((e: any) => e.position || e.company).length;
  score += Math.min(expCount * 5, 15);
  (resumeData.experience || []).forEach((exp: any) => {
    if (exp.description && exp.description.length > 50) score += 3;
    if (exp.startDate) score += 1;
    if (exp.endDate) score += 1;
  });
  const eduCount = (resumeData.education || []).filter((e: any) => e.degree || e.institution).length;
  score += Math.min(eduCount * 5, 10);
  const skillCount = (resumeData.skills || []).length;
  score += Math.min(skillCount * 2, 10);
  return Math.min(Math.max(score, 0), 100);
}
