export function buildPdfHtml(data: any, templateId: string) {
  const d = data || {};
  const primaryColor = templateId === "creativo" ? "#37863a" : templateId === "clasico" ? "#525f73" : "#0b55cf";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  @page { margin: 0; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
  body { background: white; padding: 48px 40px; color: #1a1c1e; font-size: 11px; line-height: 1.6; }
  h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #191c1d; margin-bottom: 2px; }
  h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}20; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; }
  .subtitle { font-size: 14px; color: ${primaryColor}; font-weight: 600; margin-bottom: 12px; }
  .contact { display: flex; gap: 16px; font-size: 11px; color: #525f73; margin-bottom: 20px; flex-wrap: wrap; }
  .exp-item { margin-bottom: 14px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-title { font-weight: 700; font-size: 13px; color: #191c1d; }
  .exp-date { font-size: 10px; color: #727785; font-style: italic; }
  .exp-company { font-size: 11px; color: ${primaryColor}; font-weight: 500; margin-bottom: 4px; }
  .exp-desc { font-size: 11px; color: #3f4447; }
  .edu-item { margin-bottom: 10px; }
  .skill-tag { display: inline-block; background: ${primaryColor}10; color: #191c1d; padding: 2px 10px; border-radius: 12px; font-size: 10px; margin: 2px 4px 2px 0; }
  .summary { font-size: 11px; color: #3f4447; margin-bottom: 20px; line-height: 1.7; }
  .score-badge { display: inline-block; background: ${primaryColor}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; margin-bottom: 16px; }
</style></head>
<body>
  <h1>${d.fullName || "Nombre Completo"}</h1>
  <div class="subtitle">${d.title || ""}</div>
  <div class="contact">
    ${d.email ? `<span>${d.email}</span>` : ""}
    ${d.phone ? `<span>${d.phone}</span>` : ""}
    ${d.location ? `<span>${d.location}</span>` : ""}
  </div>
  ${d.summary ? `<div class="score-badge">CV Optimizado</div><div class="summary">${d.summary}</div>` : ""}
  ${(d.experience || []).filter((e: any) => e.position || e.company).length ? `<h2>Experiencia Laboral</h2>` : ""}
  ${(d.experience || []).filter((e: any) => e.position || e.company).map((exp: any) => `
    <div class="exp-item">
      <div class="exp-header">
        <span class="exp-title">${exp.position}</span>
        <span class="exp-date">${exp.startDate ? exp.startDate : ""}${exp.endDate ? " — " + exp.endDate : ""}</span>
      </div>
      <div class="exp-company">${exp.company}</div>
      ${exp.description ? `<div class="exp-desc">${exp.description}</div>` : ""}
    </div>
  `).join("")}
  ${(d.education || []).filter((e: any) => e.degree || e.institution).length ? `<h2>Educación</h2>` : ""}
  ${(d.education || []).filter((e: any) => e.degree || e.institution).map((edu: any) => `
    <div class="edu-item">
      <div class="exp-header">
        <span class="exp-title">${edu.degree}</span>
        <span class="exp-date">${edu.startDate ? edu.startDate : ""}${edu.endDate ? " — " + edu.endDate : ""}</span>
      </div>
      <div class="exp-company">${edu.institution}</div>
    </div>
  `).join("")}
  ${(d.skills || []).length ? `<h2>Habilidades</h2>` : ""}
  <div>${(d.skills || []).map((s: string) => `<span class="skill-tag">${s}</span>`).join("")}</div>
</body></html>`;
}
