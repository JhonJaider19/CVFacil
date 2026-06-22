import { styles } from "./styles";

export const generateElegantDark = (data) => {
  const nombreCompleto = data.nombreCompleto || "ALEJANDRO MENDOZA";
  const profesion = data.profesion || "DIRECTOR DE OPERACIONES";
  const perfil =
    data.perfil ||
    "Profesional orientado a resultados con más de 8 años de trayectoria coliderando estrategias logísticas y optimización de cadenas de suministro a gran escala. Capacidad probada para reducir costos operativos y mejorar la eficiencia de equipos multidisciplinarios...";

  // Lógica para dividir la lista de habilidades en 2 columnas balanceadas
  const habilidades = data.habilidades || [
    "Gestión de Proyectos",
    "Optimización de Procesos",
    "Liderazgo de Equipos",
    "Análisis de Datos",
    "Planificación Estratégica",
    "Negociación",
  ];
  const mitad = Math.ceil(habilidades.length / 2);
  const col1 = habilidades.slice(0, mitad);
  const col2 = habilidades.slice(mitad);

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>CV - ${nombreCompleto}</title>
      <style>${styles}</style>
    </head>
    <body>

      <div class="dark-header">
        <h1>${nombreCompleto}</h1>
        <div class="subtitle">${profesion}</div>
        <div class="contact-grid">
          <span>📞 ${data.telefono || "+57 300 123 4567"}</span>
          <span>•</span>
          <span>✉️ ${data.correo || "alejandro.mendoza@email.com"}</span>
          <span>•</span>
          <span>📍 ${data.ubicacion || "Medellín, Colombia"}</span>
        </div>
      </div>

      <div class="content-body">
        
        <div class="section">
          <div class="section-title">Resumen Ejecutivo</div>
          <p class="profile-text">${perfil}</p>
        </div>

        <div class="section">
          <div class="section-title">Experiencia Profesional</div>
          
          ${(
            data.experiencias || [
              {
                puesto: "Gerente de Operaciones Regional",
                empresa: "Logística del Norte S.A.",
                fechas: "2022 - Presente",
                logros: [
                  "Reduje en un 14% los tiempos de distribución mediante la reestructuración de rutas críticas.",
                  "Supervisé un presupuesto anual de operaciones de alta escala asegurando cero desviaciones.",
                  "Implementé un nuevo sistema CRM ERP que automatizó el inventario en tiempo real.",
                ],
              },
              {
                puesto: "Coordinador de Logística Senior",
                empresa: "Distribuciones Globales",
                fechas: "2018 - 2022",
                logros: [
                  "Coordiné operaciones de comercio exterior asegurando el cumplimiento de normativas aduaneras.",
                  "Lideré un equipo directo de 12 analistas mejorando los indicadores de productividad en un 20%.",
                ],
              },
            ]
          )
            .map(
              (exp) => `
            <div class="item-entry">
              <div class="item-header">
                <div class="item-title">${exp.puesto}</div>
                <div class="item-date">${exp.fechas}</div>
              </div>
              <div class="item-subtitle">${exp.empresa}</div>
              <ul>
                ${(exp.logros || []).map((logro) => `<li>${logro}</li>`).join("")}
              </ul>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="section">
          <div class="section-title">Educación</div>
          ${(
            data.educacion || [
              {
                titulo: "Especialización en Gerencia de Operaciones",
                institucion: "Universidad EAFIT",
                fechas: "2019",
              },
              {
                titulo: "Pregrado en Ingeniería Industrial",
                institucion: "Universidad Nacional de Colombia",
                fechas: "2013 - 2018",
              },
            ]
          )
            .map(
              (edu) => `
            <div class="item-entry">
              <div class="item-header">
                <div class="item-title">${edu.titulo}</div>
                <div class="item-date">${edu.fechas}</div>
              </div>
              <div class="item-subtitle" style="margin-bottom: 0;">${edu.institucion}</div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="section">
          <div class="section-title">Competencias Clave</div>
          <div class="skills-flex">
            <div class="skills-column">
              ${col1
                .map(
                  (hab) => `
                <div class="skill-row">
                  <span>${hab}</span>
                  <span class="skill-level">Avanzado</span>
                </div>
              `,
                )
                .join("")}
            </div>
            <div class="skills-column">
              ${col2
                .map(
                  (hab) => `
                <div class="skill-row">
                  <span>${hab}</span>
                  <span class="skill-level">Profesional</span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>

      </div>

    </body>
    </html>
  `;
};
