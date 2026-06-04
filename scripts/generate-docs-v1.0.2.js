const docx = require("docx");
const fs = require("fs");
const path = require("path");

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle,
  PageBreak, TableOfContents, Header, Footer, PageNumber,
} = docx;

const sections = [
  // ===== PORTADA =====
  new Paragraph({ spacing: { before: 4000 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "CVFácil", size: 52, bold: true, color: "0b55cf", font: "Manrope" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Documentación Técnica", size: 32, color: "525f73", font: "Inter" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: "Versión 1.0.2", size: 28, bold: true, color: "191c1d", font: "Inter" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Fecha: Junio 2026", size: 22, color: "727785", font: "Inter" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Plataforma: Android, iOS, Web", size: 22, color: "727785", font: "Inter" })],
  }),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== TABLA DE CONTENIDO =====
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "Tabla de Contenido", size: 28, bold: true, color: "0b55cf", font: "Manrope" })],
  }),
  new TableOfContents("Tabla de Contenido", { hyperlink: true }),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== 1. INTRODUCCIÓN =====
  titleSec("1. Introducción"),
  par("CVFácil es una aplicación multiplataforma desarrollada con Expo SDK 54 y React Native 0.81, diseñada para la creación, edición y gestión de currículums profesionales con asistencia de inteligencia artificial. La aplicación utiliza InsForge como Backend-as-a-Service (BaaS) para autenticación, base de datos PostgreSQL y edge functions, y OpenRouter para los modelos de IA."),
  par("Esta documentación cubre la arquitectura, funcionalidades y cambios introducidos en la versión 1.0.2 del proyecto."),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== 2. STACK TECNOLÓGICO =====
  titleSec("2. Stack Tecnológico"),
  bullet("Framework: Expo SDK 54 / React Native 0.81.5"),
  bullet("Lenguaje: TypeScript 5.9"),
  bullet("Routing: Expo Router 6 (file-based routing)"),
  bullet("Estilos: NativeWind 4 (Tailwind CSS para React Native)"),
  bullet("Backend: InsForge BaaS (PostgreSQL, Auth, Edge Functions)"),
  bullet("IA: OpenRouter con modelo openrouter/free (gratuito)"),
  bullet("Estado: TanStack React Query 5 + Zustand 5"),
  bullet("Fuentes: Manrope (headlines) + Inter (body)"),

  // ===== 3. ARQUITECTURA =====
  titleSec("3. Arquitectura"),
  subSec("3.1 Frontend"),
  par("La aplicación sigue una arquitectura de navegación basada en tabs (Inicio, Mis CVs, Plantillas, Entrevista) con Expo Router. El layout raíz maneja la autenticación mediante un AuthProvider que controla si se muestra el stack de tabs o el de autenticación."),
  subSec("3.2 Backend (InsForge)"),
  par("InsForge proporciona tres servicios principales: base de datos PostgreSQL (tablas: profiles, resumes, interviews, ai_suggestions, resume_templates), autenticación con email/contraseña y OAuth (Google, GitHub), y edge functions desplegadas en Deno Subhosting."),
  subSec("3.3 Edge Function ai-proxy"),
  par("Se creó una edge function en insforge/functions/ai-proxy/index.ts que actúa como proxy entre la app y OpenRouter. La función recibe messages y model desde el frontend y realiza una petición fetch a https://openrouter.ai/api/v1/chat/completions. La API key de OpenRouter está almacenada como secreto en InsForge (nunca en el repositorio)."),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== 4. FUNCIONALIDADES =====
  titleSec("4. Funcionalidades"),
  subSec("4.1 Gestión de Currículums"),
  bullet("Creación de CV desde cero con editor de formularios"),
  bullet("Carga de CV existente por ID desde las tarjetas en Inicio"),
  bullet("Eliminación de CV con confirmación (ConfirmDialog multiplataforma)"),
  bullet("Auto-guardado con debounce de 2 segundos"),
  bullet("Puntuación automática del CV (0-100) según campos completados"),
  subSec("4.2 Editor de CV"),
  bullet("Campos vacíos por defecto al entrar al editor"),
  bullet("Carga de datos al navegar con ?id=xxx desde las tarjetas"),
  bullet("Soporte para múltiples experiencias y educaciones (hasta 5)"),
  bullet("Selector de fechas con DateTimePicker"),
  bullet("Gestión de habilidades con chips"),
  subSec("4.3 Asistente IA"),
  bullet("Chat con IA para consejos de carrera"),
  bullet("Simulación de entrevistas con puntuación en tiempo real"),
  bullet("Sugerencias de mejora de CV"),
  bullet("Modelo: openrouter/free (router automático de modelos gratuitos)"),
  subSec("4.4 Plantillas"),
  bullet("Vista previa del CV en HTML con estilos"),
  bullet("Selección entre 4 plantillas (Moderno, Clásico, Creativo, Minimalista)"),
  bullet("Generación y descarga de PDF con expo-print"),
  subSec("4.5 Autenticación"),
  bullet("Registro e inicio de sesión con email y contraseña"),
  bullet("Inicio de sesión con Google (OAuth)"),
  bullet("Inicio de sesión con GitHub (OAuth)"),
  bullet("Recuperación de contraseña"),
  bullet("Verificación de email con código OTP"),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== 5. CAMBIOS VERSIÓN 1.0.2 =====
  titleSec("5. Cambios desde Versión 1.0.0 → 1.0.2"),
  subSec("5.1 Nuevas Funcionalidades"),
  bullet("Botón de eliminar CV con ConfirmDialog (funciona en web, Android e iOS)"),
  bullet("ConfirmDialog: modal personalizado que reemplaza Alert.alert para ser multiplataforma"),
  bullet("Editor de CV con campos vacíos por defecto al entrar"),
  bullet("Navegación desde tarjetas de CV en Inicio al editor con ?id=xxx"),
  subSec("5.2 Diseño Responsivo"),
  bullet("Contenedor principal con max-w-6xl mx-auto para centrar contenido en pantallas grandes"),
  bullet("Grid de CVs con useWindowDimensions: 1 columna (<640px), 2 columnas (640-1024px), 3 columnas (>1024px)"),
  bullet("GlassHeader con max-width y centrado"),
  bullet("StatCard y AI Suggestion en layout responsive horizontal en pantallas medianas/grandes"),
  subSec("5.3 Safe Area (Android)"),
  bullet("Se reemplazó useSafeAreaInsets() por StatusBar.currentHeight de React Native"),
  bullet("Creado helper src/lib/status-bar.ts con STATUS_BAR_HEIGHT"),
  bullet("Actualizado GlassHeader, CustomTabBar y todas las pantallas de tabs con padding dinámico"),
  subSec("5.4 Corrección de Google OAuth"),
  bullet("Se añadió makeRedirectUri() de expo-auth-session para generar URL de callback correcta"),
  bullet("Se añadió WebBrowser.maybeCompleteAuthSession() antes del AuthProvider"),
  bullet("Se configuraron intentFilters en Android para el esquema cvfacil://"),
  subSec("5.5 Migración de IA a OpenRouter"),
  bullet("Creada edge function ai-proxy que llama a OpenRouter con la API key secreta"),
  bullet("Eliminado uso de insforge.ai.chat.completions.create() (deprecated)"),
  bullet("Modelo configurado como openrouter/free (router automático de modelos gratuitos)"),
  subSec("5.6 Rendimiento"),
  bullet("Añadido React.memo a CvCard.tsx y StatCard.tsx para evitar re-renders innecesarios"),
  bullet("Añadido react-native-reanimated/plugin en babel.config.js"),
  bullet("Envolver CvCard.web.tsx con useMemo para buildPdfHtml"),
  subSec("5.7 Archivos Nuevos"),
  bullet("components/ConfirmDialog.tsx — Modal de confirmación multiplataforma"),
  bullet("insforge/functions/ai-proxy/index.ts — Edge function proxy para OpenRouter"),
  bullet("src/lib/status-bar.ts — Helper para altura de barra de estado"),
  bullet("types/deno.d.ts — Declaraciones de tipos para Deno"),
  bullet("run-android.cmd — Script para compilación Android con variables de entorno"),

  // ===== 6. ESTRUCTURA DE ARCHIVOS =====
  titleSec("6. Estructura de Archivos"),
  subSec("6.1 Directorio Principal"),
  codeBlock("app/                  # Pantallas y navegación (Expo Router)"),
  codeBlock("  _layout.tsx        # Layout raíz con AuthProvider y SafeAreaProvider"),
  codeBlock("  (tabs)/            # Tabs: Inicio, Mis CVs, Plantillas, Entrevista"),
  codeBlock("    index.tsx        # Dashboard con resumen y tarjetas de CV"),
  codeBlock("    editor.tsx       # Editor de currículum"),
  codeBlock("    templates.tsx    # Vista previa y selección de plantillas"),
  codeBlock("    assistant.tsx    # Asistente IA y simulador de entrevistas"),
  codeBlock("    _layout.tsx      # Configuración de la barra de tabs"),
  codeBlock("  (auth)/            # Pantallas de autenticación"),
  codeBlock("components/          # Componentes reutilizables"),
  codeBlock("  GlassHeader.tsx    # Header con glassmorphism"),
  codeBlock("  CustomTabBar.tsx   # Barra de navegación inferior"),
  codeBlock("  CvCard.tsx         # Miniatura del CV (nativo)"),
  codeBlock("  CvCard.web.tsx     # Miniatura del CV (web con HTML)"),
  codeBlock("  ConfirmDialog.tsx  # Modal de confirmación"),
  codeBlock("src/lib/             # Lógica de negocio"),
  codeBlock("  api.ts             # Llamadas a la API de InsForge"),
  codeBlock("  ai-service.ts      # Servicio de IA (chat, sugerencias, puntuación)"),
  codeBlock("  auth-context.tsx   # Contexto de autenticación"),
  codeBlock("  insforge.ts        # Cliente de InsForge SDK"),
  codeBlock("  types.ts           # Tipos de TypeScript"),
  codeBlock("  pdf-html.ts        # Generación de HTML para PDF"),
  codeBlock("  status-bar.ts      # Helper para altura de barra de estado"),
  codeBlock("insforge/functions/  # Edge functions de InsForge"),
  codeBlock("  ai-proxy/index.ts  # Proxy para OpenRouter"),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== 7. CONFIGURACIÓN =====
  titleSec("7. Configuración y Variables de Entorno"),
  subSec("7.1 Variables de Entorno (.env)"),
  codeBlock("EXPO_PUBLIC_INSFORGE_URL=https://j67tvrnn.us-east.insforge.app"),
  codeBlock("EXPO_PUBLIC_INSFORGE_ANON_KEY=ik_..."),
  par("NOTA: El archivo .env está en .gitignore y no debe subirse al repositorio."),
  subSec("7.2 Secretos de InsForge"),
  bullet("OPENROUTER_API_KEY — Almacenado como secreto en InsForge, nunca en el código"),
  subSec("7.3 Configuración de OAuth"),
  codeBlock("[auth]"),
  codeBlock('allowed_redirect_urls = ['),
  codeBlock('  "cvfacil://oauth-callback",'),
  codeBlock('  "http://localhost:8081",'),
  codeBlock('  "http://localhost:19006",'),
  codeBlock('  "https://j67tvrnn.us-east.insforge.app"'),
  codeBlock("]"),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== 8. MODELO DE DATOS =====
  titleSec("8. Modelo de Datos"),
  subSec("8.1 Tabla resumes"),
  codeBlock("id            UUID PRIMARY KEY"),
  codeBlock("user_id       UUID REFERENCES auth.users(id)"),
  codeBlock("title         TEXT NOT NULL"),
  codeBlock("template_id   TEXT DEFAULT 'moderno'"),
  codeBlock("data          JSONB (fullName, email, phone, location, title, summary, experience[], education[], skills[])"),
  codeBlock("score         INTEGER DEFAULT 0"),
  codeBlock("thumbnail_url TEXT"),
  codeBlock("created_at    TIMESTAMPTZ DEFAULT NOW()"),
  codeBlock("updated_at    TIMESTAMPTZ DEFAULT NOW()"),
  subSec("8.2 Tipo ResumeData"),
  codeBlock("interface ResumeData {"),
  codeBlock("  fullName?: string;"),
  codeBlock("  email?: string;"),
  codeBlock("  phone?: string;"),
  codeBlock("  location?: string;"),
  codeBlock("  title?: string;"),
  codeBlock("  summary?: string;"),
  codeBlock("  experience?: Experience[];"),
  codeBlock("  education?: Education[];"),
  codeBlock("  skills?: string[];"),
  codeBlock("}"),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== 9. DESPLIEGUE =====
  titleSec("9. Despliegue"),
  subSec("9.1 Requisitos"),
  bullet("Node.js 18+"),
  bullet("Java JDK 17 (para compilar APK Android)"),
  bullet("Android SDK con platform-tools"),
  bullet("Cuenta en InsForge con proyecto vinculado"),
  subSec("9.2 Compilación Android"),
  codeBlock("# 1. Clonar repositorio"),
  codeBlock("git clone https://github.com/tuusuario/CVFacil.git"),
  codeBlock("cd CVFacil"),
  codeBlock(""),
  codeBlock("# 2. Instalar dependencias"),
  codeBlock("npm install"),
  codeBlock(""),
  codeBlock("# 3. Configurar .env con credenciales de InsForge"),
  codeBlock(""),
  codeBlock("# 4. Configurar JAVA_HOME y ANDROID_HOME"),
  codeBlock(""),
  codeBlock("# 5. Compilar e instalar APK"),
  codeBlock("npx expo run:android"),
  subSec("9.3 Web"),
  codeBlock("npx expo start --web"),
  subSec("9.4 Edge Functions"),
  codeBlock("# Desplegar función ai-proxy"),
  codeBlock("npx @insforge/cli functions deploy ai-proxy --file ./insforge/functions/ai-proxy/index.ts"),
  codeBlock(""),
  codeBlock("# Configurar secreto de OpenRouter"),
  codeBlock("npx @insforge/cli secrets add OPENROUTER_API_KEY <tu-key>"),
  new Paragraph({ children: [new PageBreak()] }),

  // ===== 10. LICENCIA =====
  titleSec("10. Licencia"),
  par("Proyecto privado. Todos los derechos reservados."),
  par("© 2026 Jhon Jaider Echavarria"),
];

function titleSec(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, size: 28, bold: true, color: "0b55cf", font: "Manrope" })],
  });
}

function subSec(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, size: 22, bold: true, color: "191c1d", font: "Inter" })],
  });
}

function par(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 20, font: "Inter" })],
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 20, font: "Inter" })],
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { after: 40 },
    indent: { left: 400 },
    children: [new TextRun({ text, size: 18, font: "Courier New", color: "525f73" })],
  });
}

async function main() {
  const doc = new Document({
    creator: "CVFácil Documentation",
    title: "CVFácil - Documentación Técnica V1.0.2",
    description: "Documentación técnica de la aplicación CVFácil versión 1.0.2",
    styles: {
      default: {
        document: {
          run: { font: "Inter", size: 20 },
          paragraph: { spacing: { after: 120 } },
        },
      },
    },
    sections: [{
      properties: {},
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "CVFácil - Documentación V1.0.2", size: 16, color: "999999", font: "Inter" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Página ", size: 16, color: "999999", font: "Inter" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999", font: "Inter" }),
            ],
          })],
        }),
      },
      children: sections,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, "..", "DOCUMENTACION", "DocumentacionCVFACIL - Versión 1.0.2.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Documento generado: ${outputPath}`);
}

main().catch(console.error);