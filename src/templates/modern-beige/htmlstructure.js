import { styles } from "./styles";

export const generateModernBeige = (data) => {
  // Manejo de Placeholders para evitar espacios vacíos en la vista previa
  const nombre = data.nombre || "NOMBRE";
  const apellido = data.apellido || "APELLIDO";
  const perfil =
    data.perfil ||
    "Abogada con más de cinco años de experiencia en derecho laboral, especializada en la negociación de contratos colectivos y la resolución de disputas laborales...";
  const fotoUri = data.fotoUri || "https://via.placeholder.com/150";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>CV - ${nombre} ${apellido}</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="cv-container">
        
        <!-- BARRA LATERAL IZQUIERDA -->
        <div class="sidebar">
          <div class="profile-photo-container">
            <img class="profile-photo" src="${fotoUri}" alt="Foto de perfil" />
          </div>
          
          <div class="user-name">
            <div>${nombre}</div>
            <div>${apellido}</div>
          </div>
          
          <div class="sidebar-section">
            <div class="sidebar-title">Contacto</div>
            <div class="contact-item">📞 ${data.telefono || "+57 6 66 66 66 66"}</div>
            <div class="contact-item">✉️ ${data.correo || "nombre.ejemplo@mail"}</div>
            <div class="contact-item">📍 ${data.ubicacion || "Bogotá, Colombia"}</div>
            ${data.linkedin ? `<div class="contact-item">🔗 ${data.linkedin}</div>` : ""}
          </div>
          
          <div class="sidebar-section">
            <div class="sidebar-title">Habilidades</div>
            ${(
              data.habilidades || [
                "Creatividad",
                "Trabajo en equipo",
                "Inteligencia emocional",
              ]
            )
              .map(
                (hab) => `
              <div class="sidebar-list-item">${hab}</div>
            `,
              )
              .join("")}
          </div>
          
          <div class="sidebar-section">
            <div class="sidebar-title">Idiomas</div>
            ${(
              data.idiomas || [
                { nombre: "Español", nivel: "Lengua materna" },
                { nombre: "Inglés", nivel: "Avanzado" },
              ]
            )
              .map(
                (lang) => `
              <div class="sidebar-list-item"><strong>${lang.nombre}:</strong> ${lang.nivel}</div>
            `,
              )
              .join("")}
          </div>

          <div class="sidebar-section">
            <div class="sidebar-title">Intereses</div>
            ${(
              data.intereses || [
                "Derechos Humanos",
                "Documentales",
                "Literatura y arte",
              ]
            )
              .map(
                (int) => `
              <div class="sidebar-list-item">${int}</div>
            `,
              )
              .join("")}
          </div>
        </div>
        
        <!-- COLUMNA PRINCIPAL DERECHA -->
        <div class="main-content">
          
          <!-- PERFIL -->
          <div class="content-section">
            <div class="section-title">Perfil</div>
            <p class="profile-text">${perfil}</p>
          </div>
          
          <!-- EXPERIENCIA PROFESIONAL -->
          <div class="content-section">
            <div class="section-title">Experiencia Profesional</div>
            
            ${(
              data.experiencias || [
                {
                  puesto: "Puesto Ocupado",
                  empresa: "Nombre de la empresa",
                  fechas: "De 00/20xx a 00/20xx",
                  ciudad: "Bogotá D.C., Colombia",
                  logros: [
                    "Represente a clientes en negociaciones de contratos laborales.",
                    "Asesoré a empresas en materia de cumplimiento normativo, reduciendo riesgos legales.",
                  ],
                },
              ]
            )
              .map(
                (exp) => `
              <div class="history-item">
                <div class="history-header">
                  <div class="item-title">${exp.puesto}</div>
                </div>
                <div class="item-subtitle">${exp.empresa}</div>
                <div class="item-date-location">${exp.fechas} (${exp.ciudad})</div>
                <ul>
                  ${(exp.logros || []).map((logro) => `<li>${logro}</li>`).join("")}
                </ul>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <!-- FORMACIÓN -->
          <div class="content-section">
            <div class="section-title">Formación</div>
            ${(
              data.educacion || [
                {
                  titulo: "Maestría en Derecho Laboral y Administrativo",
                  institucion: "Nombre de la institución",
                  fechas: "De 00/20xx a 00/20xx",
                  ciudad: "Bogotá D.C., Colombia",
                },
              ]
            )
              .map(
                (edu) => `
              <div class="history-item">
                <div class="item-title">${edu.titulo}</div>
                <div class="item-subtitle">${edu.institucion}</div>
                <div class="item-date-location">${edu.fechas} (${edu.ciudad})</div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <!-- CURSOS Y CERTIFICACIONES -->
          ${
            data.certificaciones
              ? `
          <div class="content-section">
            <div class="section-title">Cursos y Certificaciones</div>
            ${data.certificaciones
              .map(
                (cert) => `
              <div class="history-item">
                <div class="item-title" style="font-size: 10pt;">${cert.nombre}</div>
                <div class="item-date-location">${cert.fechas} (${cert.institucion})</div>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

        </div>
      </div>
    </body>
    </html>
  `;
};
