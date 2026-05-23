import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  TableOfContents, Table, TableRow, TableCell, WidthType,
  AlignmentType, BorderStyle, PageNumber, Footer, Header,
  PageBreak, ShadingType, TabStopPosition, TabStopType,
  convertInchesToTwip, LevelFormat, NumberFormat,
} from "docx";
import * as fs from "fs";
import * as path from "path";

const OUTPUT = path.resolve("DocumentacionCVFACIL.docx");

const colors = {
  primary: "0b55cf",
  secondary: "525f73",
  accent: "1a6c23",
  dark: "191c1d",
  light: "f8f9fa",
};

function heading(level, text, color = colors.dark) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
    children: [
      new TextRun({ text, bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 26 : 22, color }),
    ],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0 },
    alignment: opts.alignment,
    children: [
      new TextRun({ text, size: 20, color: colors.dark, ...opts }),
    ],
  });
}

function boldPara(label, text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: label, bold: true, size: 20, color: colors.secondary }),
      new TextRun({ text, size: 20, color: colors.dark }),
    ],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { after: 60 },
    bullet: { level },
    children: [
      new TextRun({ text, size: 20, color: colors.dark }),
    ],
  });
}

function codeBlock(code) {
  return new Paragraph({
    spacing: { after: 80 },
    shading: { type: ShadingType.CLEAR, fill: "f0f0f0" },
    indent: { left: convertInchesToTwip(0.3) },
    children: [
      new TextRun({ text: code, size: 16, font: "Courier New", color: "333333" }),
    ],
  });
}

function spacer(pts = 120) {
  return new Paragraph({ spacing: { after: pts }, children: [] });
}

function tableRow(cells, header = false) {
  return new TableRow({
    tableHeader: header,
    children: cells.map((cell, i) =>
      new TableCell({
        width: { size: i === 0 ? 30 : 70, type: WidthType.PERCENTAGE },
        shading: header ? { type: ShadingType.CLEAR, fill: colors.primary } : undefined,
        children: [
          new Paragraph({
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: cell,
                size: 18,
                bold: header,
                color: header ? "ffffff" : colors.dark,
              }),
            ],
          }),
        ],
      })
    ),
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map(r => tableRow(r)),
    ],
  });
}

async function main() {
  const doc = new Document({
    title: "Documentación Completa de CVFácil",
    description: "Documentación técnica completa del proyecto CVFácil",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20, color: colors.dark },
        },
      },
    },
    sections: [
      // ===== PORTADA =====
      {
        properties: {},
        children: [
          spacer(600),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new TextRun({ text: "CVFácil", size: 56, bold: true, color: colors.primary }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "Plataforma Inteligente de Creación", size: 32, color: colors.secondary }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "y Optimización de Currículums con IA", size: 32, color: colors.secondary }),
            ],
          }),
          spacer(200),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "Documentación Técnica Completa", size: 24, bold: true, color: colors.dark }),
            ],
          }),
          spacer(400),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Versión 1.0.0 — ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`, size: 20, color: colors.secondary }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Desarrollado con React Native (Expo) + InsForge BaaS", size: 18, color: colors.secondary }),
            ],
          }),
        ],
      },

      // ===== TABLA DE CONTENIDO =====
      {
        properties: {},
        children: [
          new Paragraph({
            spacing: { before: 240 },
            children: [
              new TextRun({ text: "TABLA DE CONTENIDO", size: 32, bold: true, color: colors.primary }),
            ],
          }),
          spacer(120),
          new TableOfContents("Índice", {
            hyperlink: true,
            headingStyleRange: ["Heading1", "Heading2", "Heading3"],
          }),
        ],
      },

      // ===== SECCIÓN 1: INTRODUCCIÓN =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "1. Introducción"),
          para("CVFácil es una aplicación mobile-first multiplataforma (iOS, Android, Web) diseñada para ayudar a profesionales a crear, optimizar y exportar currículums vitae de alta calidad utilizando inteligencia artificial. La aplicación combina un editor visual en tiempo real con asistentes de IA que proporcionan sugerencias de mejora, simulaciones de entrevistas y análisis de completitud del CV."),
          para("El proyecto fue construido con React Native (Expo SDK 54) y utiliza InsForge como Backend-as-a-Service (BaaS), proporcionando autenticación, base de datos PostgreSQL, AI Gateway con modelos de OpenAI y Anthropic, almacenamiento de archivos y funciones serverless."),
          boldPara("Propósito: ", "Democratizar la creación de currículums profesionales mediante el uso de inteligencia artificial, permitiendo a cualquier persona generar un CV optimizado para sistemas ATS (Applicant Tracking System) en minutos."),
          boldPara("Público objetivo: ", "Profesionales de todos los sectores, recién graduados, personas en transición laboral y cualquier persona que busque mejorar su presentación profesional."),
        ],
      },

      // ===== SECCIÓN 2: ARQUITECTURA GENERAL =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "2. Arquitectura General"),
          para("CVFácil sigue una arquitectura cliente-servidor moderna con un frontend React Native (Expo) que se comunica con InsForge BaaS para todas las operaciones de backend."),

          heading(HeadingLevel.HEADING_2, "2.1 Diagrama de Arquitectura"),
          para("Frontend (React Native / Expo) ←→ InsForge SDK ←→ InsForge BaaS ←→ PostgreSQL + AI Gateway"),
          para("El flujo de datos es el siguiente:"),
          bullet("El usuario interactúa con la UI de React Native (Expo Router)."),
          bullet("Las llamadas a la API se realizan a través del SDK @insforge/sdk."),
          bullet("InsForge procesa las solicitudes: autenticación, consultas a PostgreSQL, invocación de modelos de IA."),
          bullet("Las respuestas se devuelven al frontend y se renderizan con NativeWind (TailwindCSS)."),

          heading(HeadingLevel.HEADING_2, "2.2 Stack Tecnológico"),
          makeTable(
            ["Componente", "Tecnología"],
            [
              ["Lenguaje", "TypeScript 5.9"],
              ["Framework Mobile", "React Native 0.81 + Expo SDK 54"],
              ["Routing", "Expo Router 6 (file-based routing)"],
              ["Estilos", "NativeWind 4 (TailwindCSS) + Material 3"],
              ["Estado", "Zustand 5 + TanStack React Query 5"],
              ["Backend", "InsForge BaaS (PostgreSQL, Auth, AI Gateway, Storage)"],
              ["SDK Backend", "@insforge/sdk ^1.2.9"],
              ["IA / Modelos", "GPT-4o-mini, Claude Sonnet 4.5 (vía InsForge AI Gateway)"],
              ["Autenticación", "Email/Password + OAuth (Google, GitHub)"],
              ["Fuentes", "Manrope (headings) + Inter (body) vía Google Fonts"],
              ["Íconos", "@expo/vector-icons (MaterialIcons)"],
              ["PDF", "expo-print + expo-sharing"],
              ["Date Picker", "@react-native-community/datetimepicker"],
              ["Build Web", "Expo Web (static output, Metro bundler)"],
            ]
          ),
        ],
      },

      // ===== SECCIÓN 3: BACKEND — INSFORGE =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "3. Backend — InsForge BaaS"),
          para("InsForge es el Backend-as-a-Service que provee toda la infraestructura de backend para CVFácil. Se configura a través del archivo insforge.toml y el SDK @insforge/sdk."),

          heading(HeadingLevel.HEADING_2, "3.1 Configuración (insforge.toml)"),
          para("El archivo insforge.toml define las reglas de autenticación, URLs de redirección OAuth, y políticas de seguridad:"),
          codeBlock('[auth]\nallowed_redirect_urls = [\n  "cvfacil://oauth-callback",\n  "http://localhost:8081",\n  "http://localhost:19006",\n  "https://j67tvrnn.us-east.insforge.app",\n]\nrequire_email_verification = true\nverify_email_method = "code"\nreset_password_method = "code"\n\n[auth.password]\nmin_length = 6\nrequire_number = false\nrequire_lowercase = false\nrequire_uppercase = false\nrequire_special_char = false'),

          heading(HeadingLevel.HEADING_2, "3.2 Cliente SDK"),
          para("El cliente de InsForge se inicializa en src/lib/insforge.ts usando las variables de entorno EXPO_PUBLIC_INSFORGE_URL y EXPO_PUBLIC_INSFORGE_ANON_KEY."),
          codeBlock('import { createClient } from "@insforge/sdk";\n\nexport const insforge = createClient({\n  baseUrl: process.env.EXPO_PUBLIC_INSFORGE_URL,\n  anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY,\n});'),

          heading(HeadingLevel.HEADING_2, "3.3 Servicios del Backend"),
          para("InsForge provee los siguientes servicios utilizados por CVFácil:"),
          bullet("Auth: Registro, inicio de sesión, OAuth (Google/GitHub), verificación de email, recuperación de contraseña."),
          bullet("Database: PostgreSQL con 6 tablas. Consultas CRUD vía insforge.database.from().select()."),
          bullet("AI Gateway: Acceso a modelos GPT-4o-mini y Claude Sonnet 4.5 para chat, entrevistas y sugerencias."),
          bullet("Storage: No utilizado actualmente, pero disponible para futuras implementaciones de thumbnails."),
          bullet("RPC: Función confirm_user_email(text) para verificación programática de usuarios."),
        ],
      },

      // ===== SECCIÓN 4: BASE DE DATOS =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "4. Base de Datos — PostgreSQL"),
          para("La base de datos consta de 6 tablas principales. A continuación se detalla el esquema de cada una."),

          heading(HeadingLevel.HEADING_2, "4.1 Tabla: profiles"),
          para("Almacena la información del perfil de cada usuario. Se crea automáticamente al registrarse."),
          makeTable(
            ["Columna", "Tipo", "Descripción"],
            [
              ["id", "uuid (PK)", "Identificador único del usuario (mismo que auth.users)"],
              ["name", "text", "Nombre completo del usuario"],
              ["avatar_url", "text?", "URL del avatar"],
              ["email", "text?", "Correo electrónico"],
              ["created_at", "timestamptz", "Fecha de creación"],
              ["updated_at", "timestamptz", "Fecha de última actualización"],
            ]
          ),

          heading(HeadingLevel.HEADING_2, "4.2 Tabla: resumes"),
          para("Almacena los currículums creados por los usuarios. Contiene los datos estructurados del CV."),
          makeTable(
            ["Columna", "Tipo", "Descripción"],
            [
              ["id", "uuid (PK)", "Identificador único del CV"],
              ["user_id", "uuid (FK)", "Referencia a profiles.id"],
              ["title", "text", "Nombre del CV"],
              ["template_id", "text", "ID de la plantilla seleccionada"],
              ["data", "jsonb", "Datos estructurados del CV (nombre, experiencia, educación, habilidades)"],
              ["score", "integer", "Puntaje de completitud (0-100)"],
              ["thumbnail_url", "text?", "URL de la miniatura"],
              ["created_at", "timestamptz", "Fecha de creación"],
              ["updated_at", "timestamptz", "Fecha de última actualización"],
            ]
          ),

          heading(HeadingLevel.HEADING_2, "4.3 Tabla: resume_templates"),
          para("Contiene las plantillas de CV disponibles. Se agregó mediante migración SQL."),
          makeTable(
            ["Columna", "Tipo", "Descripción"],
            [
              ["id", "text (PK)", "Identificador único (moderno, clasico, creativo, minimalista)"],
              ["name", "text", "Nombre de la plantilla"],
              ["description", "text?", "Descripción de la plantilla"],
              ["thumbnail_url", "text?", "URL de la imagen de previsualización"],
              ["category", "text", "Categoría (professional, classic, creative)"],
              ["styles", "jsonb", "Estilos de la plantilla"],
              ["is_active", "boolean", "Si está activa"],
              ["created_at", "timestamptz", "Fecha de creación"],
            ]
          ),
          para("Plantillas precargadas:"),
          bullet("Moderno — Diseño limpio y contemporáneo."),
          bullet("Clásico — Formato tradicional para industrias conservadoras."),
          bullet("Creativo — Diseño visual único y moderno."),
          bullet("Minimalista — Enfoque minimalista."),

          heading(HeadingLevel.HEADING_2, "4.4 Tabla: interviews"),
          para("Almacena las sesiones de simulación de entrevistas."),
          makeTable(
            ["Columna", "Tipo", "Descripción"],
            [
              ["id", "uuid (PK)", "Identificador único de la entrevista"],
              ["user_id", "uuid (FK)", "Referencia al usuario"],
              ["resume_id", "uuid (FK)?", "CV asociado"],
              ["score", "integer", "Puntaje obtenido"],
              ["status", "text", "Estado: in_progress | completed"],
              ["duration_seconds", "integer", "Duración en segundos"],
              ["created_at", "timestamptz", "Fecha de creación"],
            ]
          ),

          heading(HeadingLevel.HEADING_2, "4.5 Tabla: interview_messages"),
          para("Almacena los mensajes individuales de cada entrevista."),
          makeTable(
            ["Columna", "Tipo", "Descripción"],
            [
              ["id", "uuid (PK)", "Identificador único del mensaje"],
              ["interview_id", "uuid (FK)", "Referencia a interviews.id"],
              ["role", "text", "Remitente: ai | user"],
              ["content", "text", "Contenido del mensaje"],
              ["created_at", "timestamptz", "Fecha de creación"],
            ]
          ),

          heading(HeadingLevel.HEADING_2, "4.6 Tabla: ai_suggestions"),
          para("Almacena las sugerencias generadas por IA para mejorar un CV."),
          makeTable(
            ["Columna", "Tipo", "Descripción"],
            [
              ["id", "uuid (PK)", "Identificador único"],
              ["resume_id", "uuid (FK)", "Referencia a resumes.id"],
              ["section", "text", "Sección del CV a mejorar"],
              ["suggestion", "text", "Texto de la sugerencia"],
              ["applied", "boolean", "Si fue aplicada"],
              ["created_at", "timestamptz", "Fecha de creación"],
            ]
          ),

          heading(HeadingLevel.HEADING_2, "4.7 Migraciones SQL"),
          para("Migración 1 — add-templates-table.sql:"),
          bullet("Crea la tabla resume_templates con 4 plantillas precargadas."),
          bullet("Agrega columna thumbnail_url a resumes."),
          bullet("Agrega columna email a profiles."),
          spacer(60),
          para("Migración 2 — confirm-user.sql:"),
          bullet("Crea la función RPC confirm_user_email(p_email text) que verifica un usuario y crea su perfil."),
          bullet("Función SECURITY DEFINER que actualiza auth.users y hace INSERT/UPDATE en profiles."),
        ],
      },

      // ===== SECCIÓN 5: AUTENTICACIÓN =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "5. Autenticación"),
          para("CVFácil utiliza el sistema de autenticación de InsForge, que soporta múltiples proveedores y métodos de verificación."),

          heading(HeadingLevel.HEADING_2, "5.1 Proveedores Soportados"),
          bullet("Email/Password: Registro e inicio de sesión con correo y contraseña (mín. 6 caracteres)."),
          bullet("Google OAuth: Inicio de sesión con cuenta de Google."),
          bullet("GitHub OAuth: Inicio de sesión con cuenta de GitHub."),

          heading(HeadingLevel.HEADING_2, "5.2 Flujo de Autenticación"),
          para("El flujo de autenticación se maneja en src/lib/auth-context.tsx mediante React Context + TanStack Query:"),
          bullet("useQuery para obtener el usuario actual (insforge.auth.getCurrentUser)."),
          bullet("useQuery para obtener el perfil del usuario desde la tabla profiles."),
          bullet("useEffect para crear perfil automáticamente si no existe."),
          bullet("signIn: Llama a insforge.auth.signInWithPassword, invalida la caché."),
          bullet("signUp: Llama a insforge.auth.signUp, retorna si requiere verificación de email."),
          bullet("signInWithOAuth: Maneja OAuth con WebBrowser.openAuthSessionAsync (native) o redirect (web)."),
          bullet("verifyEmail: Verifica el correo con OTP de 6 dígitos."),
          bullet("resetPassword: Envía email de recuperación."),
          bullet("resendOtp: Reenvía el código de verificación."),

          heading(HeadingLevel.HEADING_2, "5.3 Pantallas de Autenticación"),
          para("sign-in.tsx — Pantalla de inicio de sesión con:"),
          bullet("Botones de OAuth (Google, GitHub)."),
          bullet("Formulario de email/contraseña."),
          bullet("Enlace '¿Olvidé mi contraseña?'."),
          bullet("Enlace a registro."),
          bullet("Card 'Consejo de Carrera' con tip profesional."),
          spacer(60),
          para("sign-up.tsx — Pantalla de registro con:"),
          bullet("Botones de OAuth (Google, GitHub)."),
          bullet("Campos: Nombre Completo, Email, Contraseña (con toggle de visibilidad)."),
          bullet("Enlace a términos de servicio y privacidad."),
          spacer(60),
          para("verify.tsx — Pantalla de verificación de email con:"),
          bullet("Input OTP de 6 dígitos."),
          bullet("Botón 'Reenviar' para reenviar código."),
          bullet("Enlace para volver a iniciar sesión."),
        ],
      },

      // ===== SECCIÓN 6: FRONTEND — ESTRUCTURA =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "6. Frontend — Estructura del Proyecto"),
          para("El frontend está organizado siguiendo el patrón de Expo Router con layout basado en archivos."),

          heading(HeadingLevel.HEADING_2, "6.1 Estructura de Directorios"),
          codeBlock("CVFacil/\n├── app/                    # Pantallas (Expo Router)\n│   ├── _layout.tsx          # Layout raíz (providers, fonts)\n│   ├── +not-found.tsx       # Página 404\n│   ├── (auth)/              # Grupo de autenticación\n│   │   ├── _layout.tsx\n│   │   ├── sign-in.tsx\n│   │   ├── sign-up.tsx\n│   │   └── verify.tsx\n│   └── (tabs)/              # Grupo principal (post-login)\n│       ├── _layout.tsx      # Tab layout con CustomTabBar\n│       ├── index.tsx        # Dashboard\n│       ├── editor.tsx       # Editor de CV\n│       ├── templates.tsx    # Plantillas y PDF\n│       └── assistant.tsx    # Asistente IA y entrevistas\n├── components/              # Componentes reutilizables\n│   ├── GlassHeader.tsx      # Header translúcido con botón Salir\n│   ├── CustomTabBar.tsx     # Barra de tabs personalizada\n│   ├── GradientButton.tsx   # Botón con gradiente\n│   ├── GhostInput.tsx       # Input con etiqueta flotante\n│   ├── StatCard.tsx         # Tarjeta de estadísticas\n│   └── AiChip.tsx           # Chip de IA\n├── src/\n│   ├── lib/\n│   │   ├── insforge.ts      # Cliente InsForge SDK\n│   │   ├── auth-context.tsx  # Contexto de autenticación\n│   │   ├── api.ts           # Funciones CRUD\n│   │   ├── ai-service.ts    # Servicios de IA\n│   │   └── types.ts         # Tipos TypeScript\n│   └── stores/\n│       └── app.ts           # Store global (Zustand)\n├── migrations/              # Migraciones SQL\n├── scripts/                 # Scripts utilitarios\n├── assets/                  # Imágenes y fuentes\n├── package.json\n├── app.json\n├── tailwind.config.js\n├── tsconfig.json\n├── babel.config.js\n├── metro.config.js\n├── insforge.toml\n├── global.css\n└── .env"),

          heading(HeadingLevel.HEADING_2, "6.2 Layout Raíz (_layout.tsx)"),
          para("El layout raíz configura:"),
          bullet("QueryClientProvider de TanStack React Query para manejo de caché."),
          bullet("AuthProvider con contexto de autenticación."),
          bullet("ThemeProvider de React Navigation (soporte dark/light mode)."),
          bullet("Carga de fuentes: Manrope (400, 500, 600, 700, 800) e Inter (400, 500, 600, 700)."),
          bullet("SplashScreen que se oculta cuando termina la carga de autenticación."),
          bullet("Navegación condicional: (tabs) si hay usuario, (auth) si no."),

          heading(HeadingLevel.HEADING_2, "6.3 Tema y Colores (Material 3)"),
          para("CVFácil utiliza un sistema de colores basado en Material Design 3, definido en tailwind.config.js:"),
          makeTable(
            ["Token", "Color", "Uso"],
            [
              ["primary", "#0b55cf", "Color principal (botones, enlaces)"],
              ["primary-container", "#3870ea", "Contenedor primario"],
              ["surface", "#f8f9fa", "Fondo principal"],
              ["surface-container", "#edeeef", "Contenedor secundario"],
              ["on-surface", "#191c1d", "Texto oscuro"],
              ["on-surface-variant", "#414754", "Texto secundario"],
              ["outline", "#727785", "Bordes y outlines"],
              ["error", "#ba1a1a", "Errores y alertas"],
              ["tertiary", "#1a6c23", "Acento verde (entrevistas, éxito)"],
              ["secondary", "#525f73", "Acento gris-azul (elementos secundarios)"],
              ["inverse-surface", "#2e3132", "Fondo inverso (modo oscuro)"],
            ]
          ),
        ],
      },

      // ===== SECCIÓN 7: PANTALLAS PRINCIPALES =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "7. Pantallas Principales (Post-Login)"),

          heading(HeadingLevel.HEADING_2, "7.1 Dashboard (index.tsx)"),
          para("Pantalla principal después de iniciar sesión. Muestra un resumen del perfil del usuario."),
          bullet("Header con GlassHeader (botón Salir + avatar + notificaciones)."),
          bullet("Saludo personalizado con nombre del usuario."),
          bullet("Score del mejor CV del usuario (o 65% por defecto)."),
          bullet("Botón 'Crear nuevo CV' navega al editor."),
          bullet("StatCards: Última simulación (score entrevista), Visualizaciones (score acumulado)."),
          bullet("AI Suggestion: Muestra la sugerencia más reciente de IA."),
          bullet("Lista de CVs del usuario con score, fecha y thumbnail."),
          bullet("Card 'Nueva Versión' para crear una variante."),

          heading(HeadingLevel.HEADING_2, "7.2 Editor (editor.tsx)"),
          para("Editor completo de currículum con los siguientes campos y características:"),
          bullet("Barra de progreso con gradiente que muestra % de completitud."),
          bullet("Información Personal: Nombre, Email, Teléfono, Ubicación, Título Profesional."),
          bullet("Resumen Profesional: Área de texto multilinea."),
          bullet("Experiencia Laboral: Hasta 5 entradas con cargo, empresa, fechas (date picker nativo), descripción."),
          bullet("Educación: Hasta 5 entradas con título, institución, fechas."),
          bullet("Habilidades: Tags con botón de eliminar, input de texto con botón +."),
          bullet("Auto-save: Guarda automáticamente 2 segundos después de dejar de escribir."),
          bullet("Cálculo de score offline vía generateCvScore() en ai-service.ts."),
          bullet("Consejos de IA y chips de mejora rápida."),

          heading(HeadingLevel.HEADING_2, "7.3 Plantillas (templates.tsx)"),
          para("Selector de plantillas y generación de PDF."),
          bullet("Vista previa del CV con datos reales del usuario."),
          bullet("4 plantillas seleccionables: Moderno, Clásico, Creativo, Minimalista."),
          bullet("Persistencia: la plantilla seleccionada se guarda en resumes.template_id."),
          bullet("Descarga en PDF con expo-print + expo-sharing."),
          bullet("HTML template profesional con estilos inline, optimizado para ATS."),
          bullet("Fallback offline: si no hay plantillas en DB, usa array hardcodeado."),

          heading(HeadingLevel.HEADING_2, "7.4 Asistente IA (assistant.tsx)"),
          para("Asistente con inteligencia artificial con tres modos principales:"),
          boldPara("Chat General:", " Conversación libre con IA entrenada como coach profesional. Usa GPT-4o-mini con system prompt específico."),
          boldPara("Simulador de Entrevista:", ""),
          bullet("Modo interactivo timer + scoring."),
          bullet("Preguntas generadas por Claude Sonnet 4.5 para respuestas más naturales."),
          bullet("Score dinámico que aumenta con respuestas detalladas (+2 a +5 puntos)."),
          bullet("Timer en formato MM:SS."),
          bullet("Feedback profesional al finalizar con fortalezas, áreas de mejora y recomendaciones."),
          boldPara("Mejora de CV:", " Analiza el CV actual con IA y sugiere mejoras específicas."),
          boldPara("Consejos:", " Genera 3 consejos prácticos para destacar en búsqueda laboral."),
        ],
      },

      // ===== SECCIÓN 8: SERVICIOS DE IA =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "8. Servicios de Inteligencia Artificial"),
          para("CVFácil integra inteligencia artificial a través del AI Gateway de InsForge, que proporciona acceso a múltiples modelos."),

          heading(HeadingLevel.HEADING_2, "8.1 Modelos Utilizados"),
          makeTable(
            ["Modelo", "Proveedor", "Uso"],
            [
              ["GPT-4o-mini", "OpenAI", "Chat general, mejora de CV, consejos, sugerencias"],
              ["Claude Sonnet 4.5", "Anthropic", "Simulador de entrevista (respuestas más naturales)"],
            ]
          ),
          para("El AI Gateway de InsForge también proporciona acceso a: Gemini 3 Pro (Google), Grok 4.1 (xAI), DeepSeek V3.2, entre otros."),

          heading(HeadingLevel.HEADING_2, "8.2 Servicios Implementados (ai-service.ts)"),
          boldPara("chatCompletion():", " Función base que envía mensajes al modelo especificado. Usa insforge.ai.chat.completions.create() con temperatura 0.7 y máximo 1024 tokens."),
          boldPara("generateInterviewQuestion():", " Genera preguntas de entrevista usando Claude Sonnet 4.5 con system prompt de reclutador senior."),
          boldPara("generateCvSuggestion():", " Analiza el CV completo y genera sugerencias de mejora usando GPT-4o-mini."),
          boldPara("generateCvScore():", " Calcula el score de completitud del CV offline (sin llamada AI) basado en:"),
          bullet("Presencia de campos básicos (nombre, email, teléfono, ubicación, título): +20 pts."),
          bullet("Resumen profesional con más de 30 caracteres: +10 pts."),
          bullet("Experiencia laboral (hasta 3 entradas, hasta +5 pts cada una): +15 pts."),
          bullet("Descripciones detalladas (+3 pts si >50 chars), fechas (+1 pt cada una)."),
          bullet("Educación (hasta 2 entradas, +5 pts cada una): +10 pts."),
          bullet("Habilidades (hasta 5, +2 pts cada una): +10 pts."),
          bullet("Score base de 40 pts. Máximo 100 pts."),
        ],
      },

      // ===== SECCIÓN 9: API Y COMUNICACIÓN CON BACKEND =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "9. API y Comunicación con Backend"),
          para("Todas las operaciones de backend se realizan a través del archivo src/lib/api.ts, que utiliza el cliente de InsForge."),

          heading(HeadingLevel.HEADING_2, "9.1 Funciones CRUD"),
          makeTable(
            ["Función", "Endpoint DB", "Descripción"],
            [
              ["getProfile(userId)", "profiles.select().eq(id)", "Obtiene perfil del usuario"],
              ["getResumes(userId)", "resumes.select().eq(user_id)", "Lista CVs del usuario"],
              ["getResume(id)", "resumes.select().eq(id)", "Obtiene un CV específico"],
              ["createResume(userId, title)", "resumes.insert()", "Crea un nuevo CV"],
              ["updateResume(id, updates)", "resumes.update().eq(id)", "Actualiza un CV"],
              ["deleteResume(id)", "resumes.delete().eq(id)", "Elimina un CV"],
              ["getLatestInterview(userId)", "interviews.select().eq(user_id).limit(1)", "Última entrevista"],
              ["getInterviewMessages(interviewId)", "interview_messages.select().eq(interview_id)", "Mensajes de entrevista"],
              ["getTemplates()", "resume_templates.select().eq(is_active, true)", "Lista plantillas activas"],
              ["updateResumeTemplate(resumeId, templateId)", "resumes.update({template_id})", "Cambia plantilla del CV"],
              ["getSuggestions(resumeId)", "ai_suggestions.select().eq(resume_id)", "Sugerencias de IA para un CV"],
            ]
          ),
        ],
      },

      // ===== SECCIÓN 10: GENERACIÓN DE PDF =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "10. Generación de PDF"),
          para("CVFácil genera PDFs de alta calidad directamente desde el dispositivo usando expo-print y expo-sharing."),

          heading(HeadingLevel.HEADING_2, "10.1 Proceso"),
          bullet("Se construye un HTML con estilos CSS inline profesional."),
          bullet("expo-print convierte el HTML a PDF (Print.printToFileAsync)."),
          bullet("expo-sharing permite compartir o guardar el archivo."),

          heading(HeadingLevel.HEADING_2, "10.2 Formato del PDF"),
          para("El PDF generado incluye:"),
          bullet("Formato A4 con márgenes de 48x40px."),
          bullet("Nombre completo en tamaño 26px bold."),
          bullet("Título profesional en color primario."),
          bullet("Información de contacto (email, teléfono, ubicación)."),
          bullet("Resumen profesional."),
          bullet("Experiencia laboral con cargo, empresa, fechas, descripción."),
          bullet("Educación con título, institución, fechas."),
          bullet("Habilidades como tags."),
          bullet("Los colores se adaptan a la plantilla seleccionada (azul, verde, gris)."),
          bullet("Optimizado para sistemas ATS (formato limpio y legible)."),
        ],
      },

      // ===== SECCIÓN 11: COMPONENTES REUTILIZABLES =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "11. Componentes Reutilizables"),
          para("CVFácil cuenta con 6 componentes reutilizables ubicados en el directorio components/."),

          heading(HeadingLevel.HEADING_2, "11.1 GlassHeader"),
          para("Header translúcido con efecto glass (backdrop-filter: blur). Contiene el logo 'CVFácil' y un botón 'Salir' que ejecuta signOut(). Ubicación fija en la parte superior (position: absolute, z-index: 50)."),

          heading(HeadingLevel.HEADING_2, "11.2 CustomTabBar"),
          para("Barra de navegación inferior personalizada con 4 pestañas: Inicio, Mis CVs, Plantillas, Entrevista. Usa MaterialIcons y muestra la pestaña activa resaltada."),

          heading(HeadingLevel.HEADING_2, "11.3 GradientButton"),
          para("Botón con gradiente lineal (por defecto azul primario). Acepta colores personalizados, clases adicionales y cualquier prop de Pressable."),

          heading(HeadingLevel.HEADING_2, "11.4 GhostInput"),
          para("Input de texto con etiqueta superior y borde inferior que cambia de color al enfocarse. Animación de color en la etiqueta (de gris a azul primario)."),

          heading(HeadingLevel.HEADING_2, "11.5 StatCard"),
          para("Tarjeta de estadísticas con ícono, valor, subtítulo y tendencia. Usada en el Dashboard para mostrar score de entrevista y visualizaciones."),

          heading(HeadingLevel.HEADING_2, "11.6 AiChip"),
          para("Chip con diferentes variantes visuales: suggestion (azul), tip (verde), insight (azul claro). Usado en el editor para sugerencias rápidas de IA."),
        ],
      },

      // ===== SECCIÓN 12: DEPENDENCIAS =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "12. Dependencias y Librerías"),
          para("A continuación se listan todas las dependencias del proyecto con su propósito."),

          heading(HeadingLevel.HEADING_2, "12.1 Dependencias de Producción"),
          makeTable(
            ["Librería", "Versión", "Propósito"],
            [
              ["expo", "~54.0.33", "Framework principal multiplataforma"],
              ["react", "19.1.0", "Librería de UI"],
              ["react-native", "0.81.5", "Runtime nativo"],
              ["expo-router", "~6.0.23", "Enrutador basado en archivos"],
              ["nativewind", "^4.2.3", "TailwindCSS para React Native"],
              ["tailwindcss", "^3.4.19", "Framework de estilos utility-first"],
              ["@insforge/sdk", "^1.2.9", "SDK de InsForge BaaS"],
              ["@tanstack/react-query", "^5.100.10", "Manejo de estado asíncrono"],
              ["zustand", "^5.0.13", "Estado global liviano"],
              ["expo-print", "^56.0.3", "Generación de PDF"],
              ["expo-sharing", "^56.0.12", "Compartir archivos nativo"],
              ["expo-file-system", "^56.0.7", "Sistema de archivos"],
              ["expo-auth-session", "~7.0.11", "Autenticación OAuth"],
              ["expo-web-browser", "~15.0.10", "Navegador para OAuth"],
              ["@react-native-community/datetimepicker", "^9.1.0", "Selector de fecha nativo"],
              ["expo-linear-gradient", "~15.0.8", "Gradientes"],
              ["expo-splash-screen", "~31.0.13", "Pantalla de carga inicial"],
              ["expo-font", "~14.0.11", "Carga de fuentes"],
              ["expo-linking", "~8.0.11", "Deep linking"],
              ["expo-constants", "~18.0.13", "Constantes de Expo"],
              ["react-native-reanimated", "~4.1.1", "Animaciones nativas"],
              ["react-native-safe-area-context", "~5.6.0", "Área segura"],
              ["react-native-screens", "~4.16.0", "Pantallas nativas"],
              ["react-native-web", "~0.21.0", "Renderizado web"],
              ["react-native-worklets", "0.5.1", "Worklets para animaciones"],
              ["@expo-google-fonts/inter", "^0.4.2", "Fuente Inter"],
              ["@expo-google-fonts/manrope", "^0.4.2", "Fuente Manrope"],
              ["@expo/vector-icons", "^15.0.3", "Íconos MaterialIcons"],
              ["@react-navigation/native", "^7.1.8", "Navegación"],
            ]
          ),

          heading(HeadingLevel.HEADING_2, "12.2 Dependencias de Desarrollo"),
          makeTable(
            ["Librería", "Versión", "Propósito"],
            [
              ["typescript", "~5.9.2", "Compilador TypeScript"],
              ["@types/react", "~19.1.0", "Tipos de React"],
              ["docx", "^9.6.1", "Generación de documentos Word (para esta documentación)"],
              ["react-test-renderer", "19.1.0", "Testing"],
            ]
          ),
        ],
      },

      // ===== SECCIÓN 13: TIPOS Y MODELOS DE DATOS =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "13. Tipos y Modelos de Datos (TypeScript)"),
          para("Todos los tipos están definidos en src/lib/types.ts y cubren las 6 tablas de la base de datos más las estructuras auxiliares."),

          heading(HeadingLevel.HEADING_2, "13.1 Interfaces Principales"),
          makeTable(
            ["Interface", "Campos Clave"],
            [
              ["Profile", "id, name, avatar_url, email, created_at, updated_at"],
              ["Resume", "id, user_id, title, template_id, data (jsonb), score, thumbnail_url"],
              ["ResumeData", "fullName, email, phone, location, title, summary, experience[], education[], skills[]"],
              ["Experience", "position, company, startDate, endDate, description"],
              ["Education", "degree, institution, startDate, endDate"],
              ["Interview", "id, user_id, resume_id, score, status, duration_seconds"],
              ["InterviewMessage", "id, interview_id, role, content"],
              ["ResumeTemplate", "id, name, description, thumbnail_url, category, styles, is_active"],
              ["AiSuggestion", "id, resume_id, section, suggestion, applied"],
            ]
          ),
        ],
      },

      // ===== SECCIÓN 14: USUARIO DE PRUEBA =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "14. Usuario de Prueba"),
          para("Se ha creado un usuario de prueba para facilitar el testing de la aplicación:"),

          makeTable(
            ["Campo", "Valor"],
            [
              ["Email", "prueba1@cvfacil.com"],
              ["Contraseña", "prueba1"],
              ["Nombre", "Prueba 1"],
              ["Email verificado", "Sí (vía función RPC confirm_user_email)"],
              ["Perfil creado", "Sí"],
            ]
          ),
          spacer(60),
          para("El script scripts/confirm-user.mjs automatiza la verificación del usuario usando la función RPC confirm_user_email(text) de PostgreSQL."),
        ],
      },

      // ===== SECCIÓN 15: CONFIGURACIÓN DEL PROYECTO =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "15. Configuración del Proyecto"),

          heading(HeadingLevel.HEADING_2, "15.1 package.json"),
          para("Scripts disponibles:"),
          makeTable(
            ["Comando", "Descripción"],
            [
              ["npm start", "Inicia Expo dev server"],
              ["npm run android", "Inicia en emulador Android"],
              ["npm run ios", "Inicia en simulador iOS"],
              ["npm run web", "Inicia en navegador web"],
            ]
          ),

          heading(HeadingLevel.HEADING_2, "15.2 app.json (Expo Config)"),
          para("Configuración principal de Expo:"),
          bullet("name: CVFacil, slug: CVFacil, version: 1.0.0."),
          bullet("scheme: cvfacil (para deep linking OAuth)."),
          bullet("orientation: portrait."),
          bullet("web.bundler: metro, web.output: static (SSG)."),
          bullet("newArchEnabled: true (Fabric architecture)."),
          bullet("Plugins: expo-router."),
          bullet("iOS: soporta tablet. Android: edgeToEdgeEnabled."),

          heading(HeadingLevel.HEADING_2, "15.3 TypeScript (tsconfig.json)"),
          para("Configuración:"),
          bullet("Extiende expo/tsconfig.base."),
          bullet("strict: true."),
          bullet("Path alias @/* → ./"),

          heading(HeadingLevel.HEADING_2, "15.4 Variables de Entorno (.env)"),
          para("Variables requeridas:"),
          bullet("EXPO_PUBLIC_INSFORGE_URL — URL del proyecto InsForge."),
          bullet("EXPO_PUBLIC_INSFORGE_ANON_KEY — Clave anónima de InsForge."),

          heading(HeadingLevel.HEADING_2, "15.5 Tailwind CSS Config"),
          para("Colores Material 3 personalizados, 12 fuentes, border-radius (12px, 16px), espaciado personalizado."),
        ],
      },

      // ===== SECCIÓN 16: BUILD Y DESPLIEGUE =====
      {
        properties: {},
        children: [
          heading(HeadingLevel.HEADING_1, "16. Build y Despliegue"),
          heading(HeadingLevel.HEADING_2, "16.1 Web Export"),
          para("El proyecto se exporta correctamente a web estática con los siguientes resultados:"),
          bullet("16 rutas estáticas generadas."),
          bullet("~2.71 MB JavaScript bundle total."),
          bullet("~17.7 kB CSS."),
          bullet("Rutas: /, /verify, /editor, /sign-in, /sign-up, /assistant, /templates, /+not-found, y sub-rutas de grupos (auth) y (tabs)."),
          spacer(60),
          heading(HeadingLevel.HEADING_2, "16.2 TypeScript"),
          para("El proyecto compila sin errores (tsc --noEmit) con strict mode activado."),

          heading(HeadingLevel.HEADING_2, "16.3 Para Despliegue"),
          para("Para desplegar la aplicación web:"),
          codeBlock("npx expo export --platform web\n# El directorio dist/ contiene los archivos estáticos"),
          para("Para builds nativos:"),
          codeBlock("npx expo run:android\nnpx expo run:ios"),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`Documento generado: ${OUTPUT}`);
}

main().catch(console.error);
