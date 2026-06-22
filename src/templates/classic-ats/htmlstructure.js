import { styles } from "./styles";

export const generateClassicATS = (data) => {
  // Datos por defecto (Placeholders) basados exactamente en la imagen de Camila Vargas
  const nombreCompleto = data.nombreCompleto || "CAMILA VARGAS";
  const profesion = data.profesion || "ARQUITECTA";
  const perfil =
    data.perfil ||
    "Arquitecta apasionada con más de 5 años de experiencia en diseño y gestión de proyectos arquitectónicos residenciales y comerciales. Habilidad comprobada para liderar equipos en la entrega de proyectos dentro de los plazos y presupuestos establecidos...";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>CV - ${nombreCompleto}</title>
      <style>${styles}</style>
    </head>
    <body>

      <div class="header">
        <h1>${nombreCompleto}</h1>
        <div class="subtitle">${profesion}</div>
        <div class="contact-info">
          ${data.telefono || "+57 01 01 01 01 01"} &nbsp;|&nbsp; ${data.correo || "tucorreo@mail.com"}
          ${data.enlace ? `&nbsp;|&nbsp; ${data.enlace}` : ""}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Perfil Profesional</div>
        <p class="profile-text">${perfil}</p>
      </div>

      <div class="section">
        <div class="section-title">Educación</div>
        <div class="education-container">
          ${(
            data.educacion || [
              {
                titulo: "Maestría en Arquitectura Sostenible",
                institucion: "Universidad Nacional de Colombia",
                fechas: "20XX - 20XX",
                nota: "Enfoque en Gestión Integral Sostenible de Proyectos",
              },
              {
                titulo: "Maestría en Arquitectura Sostenible | 2",
                institucion: "Universidad Nacional de Colombia",
                fechas: "20XX - 20XX",
                nota: "Enfoque en Gestión Integral Sostenible de Proyectos",
              },
            ]
          )
            .slice(0, 2)
            .map(
              (edu) => `
            <div class="education-block">
              <div class="item-row">
                <div class="item-title">${edu.titulo}</div>
                <div class="item-aside">${edu.fechas || ""}</div>
              </div>
              <div class="item-subtitle">${edu.institucion}</div>
              ${edu.nota ? `<div class="item-aside" style="text-align:left; color:#777; font-size:9pt; margin-top:2px;">${edu.nota}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Experiencia Profesional</div>
        
        ${(
          data.experiencias || [
            {
              puesto: "Arquitecta Senior",
              empresa: "Arquitectura & Diseños XYZ",
              ciudad: "Bogotá, Colombia",
              fechas: "Enero 2024 - Presente",
              logros: [
                "Dirigí un equipo de 5 arquitectos en el desarrollo de proyectos residenciales de alta densidad.",
                "Coordiné con ingenieros y diseñadores para asegurar la implementación efectiva de especificaciones de diseño.",
                "Realicé presentaciones a clientes y partes interesadas, logrando un aumento del 20% en la satisfacción del cliente.",
              ],
            },
            {
              puesto: "Arquitecta Asociada",
              empresa: "Arquitectura & Diseños XYZ",
              ciudad: "Bogotá, Colombia",
              fechas: "Enero 20XX - Marzo 20XX",
              logros: [
                "Participé en la planificación y diseño de más de 30 proyectos comerciales y públicos.",
                "Colaboré estrechamente con clientes para definir requisitos del proyecto de manera satisfactoria.",
              ],
            },
          ]
        )
          .map(
            (exp) => `
          <div class="item-entry">
            <div class="item-row">
              <div class="item-title">${exp.puesto}</div>
              <div class="item-aside">${exp.ciudad || ""}</div>
            </div>
            <div class="item-row">
              <div class="item-subtitle">${exp.empresa}</div>
              <div class="item-aside" style="color: #555;">${exp.fechas}</div>
            </div>
            <ul>
              ${(exp.logros || []).map((logro) => `<li>${logro}</li>`).join("")}
            </ul>
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="section">
        <div class="section-title">Habilidades</div>
        <div class="grid-container">
          ${(
            data.habilidades || [
              "Trabajo en equipo",
              "AutoCAD",
              "Revit",
              "Adobe Photoshop",
              "Word",
              "SketchUp",
              "LEED AP",
              "Modelado 3D",
            ]
          )
            .map(
              (hab) => `
            <div class="grid-item">${hab}</div>
          `,
            )
            .join("")}
        </div>
      </div>

      ${
        data.certificaciones && data.certificaciones.length > 0
          ? `
      <div class="section">
        <div class="section-title">Certificaciones</div>
        <div class="item-entry">
          <ul>
            ${data.certificaciones.map((cert) => `<li><strong>${cert.nombre}</strong> - ${cert.institucion} (${cert.fechas})</li>`).join("")}
          </ul>
        </div>
      </div>
      `
          : ""
      }

      <div class="section">
        <div class="section-title">Idiomas</div>
        <div class="languages-container">
          ${(
            data.idiomas || [
              { nombre: "Español", nivel: "Nativo" },
              { nombre: "Alemán", nivel: "Avanzado (C1)" },
              { nombre: "Inglés", nivel: "Básico (A2)" },
            ]
          )
            .map(
              (lang) => `
            <div class="lang-item">
              <strong>${lang.nombre}:</strong> ${lang.nivel}
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

    </body>
    </html>
  `;
};
