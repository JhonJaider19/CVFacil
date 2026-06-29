export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  nombre: string;
  apellido: string;
  profesion: string;
  fotoUri: string | null;
  telefono: string;
  correo: string;
  ubicacion: string;
  linkedin: string;
  resumen: string;
  experiencias: Experiencia[];
  educacion: Educacion[];
  habilidades: string[];
  idiomas: Idioma[];
  intereses: string[];
  certificaciones: Certificacion[];
}

export interface Experiencia {
  puesto: string;
  empresa: string;
  fechas: string;
  ciudad: string;
  logros: string[];
}

export interface Educacion {
  titulo: string;
  institucion: string;
  fechas: string;
  ciudad: string;
}

export interface Idioma {
  nombre: string;
  nivel: string;
}

export interface Certificacion {
  nombre: string;
  institucion: string;
  fechas: string;
}

export function normalizeResumeData(data: any): ResumeData {
  if (!data) return emptyResumeData();

  // Si ya está en formato nuevo, devolverlo
  if (data.nombre !== undefined || data.nombreCompleto !== undefined) {
    return {
      nombre: data.nombre || data.nombreCompleto?.split(" ")[0] || "",
      apellido: data.apellido || data.nombreCompleto?.split(" ").slice(1).join(" ") || "",
      profesion: data.profesion || data.title || "",
      fotoUri: data.fotoUri || null,
      telefono: data.telefono || data.phone || "",
      correo: data.correo || data.email || "",
      ubicacion: data.ubicacion || data.location || "",
      linkedin: data.linkedin || data.enlace || "",
      resumen: data.resumen || data.perfil || data.summary || "",
      experiencias: (data.experiencias || data.experience || []).map((e: any) => ({
        puesto: e.puesto || e.position || "",
        empresa: e.empresa || e.company || "",
        fechas: e.fechas || (e.startDate ? `${e.startDate}${e.endDate ? ` — ${e.endDate}` : ""}` : ""),
        ciudad: e.ciudad || "",
        logros: e.logros || (e.description ? [e.description] : []),
      })),
      educacion: (data.educacion || data.education || []).map((e: any) => ({
        titulo: e.titulo || e.degree || "",
        institucion: e.institucion || e.institution || "",
        fechas: e.fechas || (e.startDate ? `${e.startDate}${e.endDate ? ` — ${e.endDate}` : ""}` : ""),
        ciudad: e.ciudad || "",
      })),
      habilidades: data.habilidades || data.skills || [],
      idiomas: data.idiomas || [],
      intereses: data.intereses || [],
      certificaciones: data.certificaciones || [],
    };
  }

  return emptyResumeData();
}

export function emptyResumeData(): ResumeData {
  return {
    nombre: "",
    apellido: "",
    profesion: "",
    fotoUri: null,
    telefono: "",
    correo: "",
    ubicacion: "",
    linkedin: "",
    resumen: "",
    experiencias: [],
    educacion: [],
    habilidades: [],
    idiomas: [],
    intereses: [],
    certificaciones: [],
  };
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  data: ResumeData;
  score: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  resume_id: string | null;
  score: number;
  status: "in_progress" | "completed";
  duration_seconds: number;
  created_at: string;
}

export interface InterviewMessage {
  id: string;
  interview_id: string;
  role: "ai" | "user";
  content: string;
  created_at: string;
}

export interface AiSuggestion {
  id: string;
  resume_id: string;
  section: string;
  suggestion: string;
  applied: boolean;
  created_at: string;
}
