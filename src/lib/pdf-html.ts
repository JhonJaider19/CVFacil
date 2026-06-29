import { generateModernBeige } from "@/src/templates/modern-beige/htmlstructure";
import { generateClassicATS } from "@/src/templates/classic-ats/htmlstructure";
import { generateElegantDark } from "@/src/templates/elegant-dark/htmlstructure";
import type { ResumeData } from "./types";

function mapToModernBeige(data: ResumeData): any {
  return {
    nombre: data.nombre,
    apellido: data.apellido,
    perfil: data.resumen,
    fotoUri: data.fotoUri || "https://via.placeholder.com/150",
    telefono: data.telefono,
    correo: data.correo,
    ubicacion: data.ubicacion,
    linkedin: data.linkedin,
    habilidades: data.habilidades,
    idiomas: data.idiomas,
    intereses: data.intereses,
    experiencias: data.experiencias.map(e => ({
      puesto: e.puesto,
      empresa: e.empresa,
      fechas: e.fechas,
      ciudad: e.ciudad,
      logros: e.logros.length ? e.logros : ["Logro destacado"],
    })),
    educacion: data.educacion.map(e => ({
      titulo: e.titulo,
      institucion: e.institucion,
      fechas: e.fechas,
      ciudad: e.ciudad,
    })),
    certificaciones: data.certificaciones,
  };
}

function mapToClassicATS(data: ResumeData): any {
  return {
    nombreCompleto: `${data.nombre} ${data.apellido}`.trim() || "NOMBRE APELLIDO",
    profesion: data.profesion || "PROFESIÓN",
    perfil: data.resumen || "Perfil profesional...",
    telefono: data.telefono,
    correo: data.correo,
    enlace: data.linkedin,
    educacion: data.educacion.map(e => ({
      titulo: e.titulo,
      institucion: e.institucion,
      fechas: e.fechas,
      nota: "",
    })),
    experiencias: data.experiencias.map(e => ({
      puesto: e.puesto,
      empresa: e.empresa,
      ciudad: e.ciudad,
      fechas: e.fechas,
      logros: e.logros.length ? e.logros : ["Logro destacado"],
    })),
    habilidades: data.habilidades,
    certificaciones: data.certificaciones,
    idiomas: data.idiomas,
  };
}

function mapToElegantDark(data: ResumeData): any {
  return {
    nombreCompleto: `${data.nombre} ${data.apellido}`.trim() || "NOMBRE APELLIDO",
    profesion: data.profesion || "PROFESIÓN",
    perfil: data.resumen || "Perfil profesional...",
    telefono: data.telefono,
    correo: data.correo,
    ubicacion: data.ubicacion,
    experiencias: data.experiencias.map(e => ({
      puesto: e.puesto,
      empresa: e.empresa,
      fechas: e.fechas,
      logros: e.logros.length ? e.logros : ["Logro destacado"],
    })),
    educacion: data.educacion.map(e => ({
      titulo: e.titulo,
      institucion: e.institucion,
      fechas: e.fechas,
    })),
    habilidades: data.habilidades,
  };
}

const LEGACY_TEMPLATE_MAP: Record<string, string> = {
  moderno: "modern-beige",
  clasico: "classic-ats",
  creativo: "elegant-dark",
  minimalista: "classic-ats",
};

export function buildPdfHtml(data: ResumeData, templateId: string): string {
  const normalized = LEGACY_TEMPLATE_MAP[templateId] ?? templateId;
  switch (normalized) {
    case "modern-beige":
      return generateModernBeige(mapToModernBeige(data));
    case "classic-ats":
      return generateClassicATS(mapToClassicATS(data));
    case "elegant-dark":
      return generateElegantDark(mapToElegantDark(data));
    default:
      return generateModernBeige(mapToModernBeige(data));
  }
}