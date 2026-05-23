# CVFacil

**CVFacil** es una aplicación móvil multiplataforma (iOS, Android y Web) construida con React Native (Expo) que te permite crear currículums profesionales con la ayuda de inteligencia artificial y practicar entrevistas de trabajo simuladas.

## Funcionalidades

- **Creador de CV** — Editor de currículums con campos de información personal, experiencia laboral, educación y habilidades. Incluye múltiples plantillas (Moderno, Clásico, Creativo, Minimalista) y exportación a PDF.
- **Asistente de IA** — Chat inteligente para mejorar tu CV, recibir consejos de carrera y practicar entrevistas simuladas con IA en tiempo real.
- **Simulador de Entrevistas** — Entrevistas interactivas con cronómetro y puntuación, impulsadas por modelos de IA.
- **Autenticación** — Registro e inicio de sesión con correo electrónico y proveedores OAuth.
- **Persistencia en la nube** — Tus datos se guardan de forma segura mediante InsForge.

## Tecnologías

- **Framework:** Expo SDK 54 + React Native 0.81
- **Lenguaje:** TypeScript
- **Enrutamiento:** expo-router
- **Estilos:** NativeWind (Tailwind CSS)
- **Backend:** InsForge (BaaS con autenticación, base de datos y AI gateway)
- **IA:** OpenAI GPT-4o-mini y Anthropic Claude Sonnet 4.5
- **Exportación:** PDF vía expo-print / expo-sharing

## Requisitos

- Node.js 18+
- Expo CLI
- Dispositivo físico o emulador (iOS / Android) o navegador web

## Instalación

```bash
git clone https://github.com/TU-USUARIO/CVFacil.git
cd CVFacil
npm install
npx expo start
```

## Licencia

Todos los derechos reservados.
