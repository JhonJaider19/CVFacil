export const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #111111;
    font-size: 10.5pt;
    line-height: 1.4;
    background-color: #ffffff;
    padding: 40px 50px;
  }

  /* ENCABEZADO (Header) */
  .header {
    text-align: center;
    margin-bottom: 25px;
  }

  .header h1 {
    font-size: 24pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 4px;
  }

  .header .subtitle {
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: 600;
    color: #444444;
    margin-bottom: 6px;
  }

  .header .contact-info {
    font-size: 9.5pt;
    color: #555555;
  }

  /* SECCIONES GLOBALES */
  .section {
    margin-bottom: 22px;
    page-break-inside: avoid;
  }

  .section-title {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #000000;
    letter-spacing: 1px;
    border-bottom: 1.5px solid #000000;
    padding-bottom: 2px;
    margin-bottom: 12px;
  }

  .profile-text {
    font-size: 10pt;
    text-align: justify;
    color: #222222;
  }

  /* SECCIÓN EDUCACIÓN (Dos columnas en paralelo) */
  .education-container {
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }

  .education-block {
    width: 48%;
  }

  /* HISTORIAL (Experiencia / Educación) */
  .item-entry {
    margin-bottom: 14px;
    page-break-inside: avoid;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .item-title {
    font-weight: bold;
    font-size: 10.5pt;
  }

  .item-aside {
    font-size: 9.5pt;
    color: #333333;
    text-align: right;
  }

  .item-subtitle {
    font-style: italic;
    font-size: 10pt;
    color: #444444;
    margin-top: 1px;
  }

  /* VIÑETAS / LOGROS */
  .item-entry ul {
    margin-left: 18px;
    margin-top: 5px;
    font-size: 9.5pt;
    color: #222222;
  }

  .item-entry li {
    margin-bottom: 3px;
    text-align: justify;
  }

  /* CUADRÍCULAS (Grid para Habilidades e Idiomas) */
  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    font-size: 9.5pt;
    padding-left: 10px;
  }

  .grid-item {
    display: flex;
    align-items: center;
  }

  /* Viñeta personalizada para la lista en Grid */
  .grid-item::before {
    content: "•";
    color: #000000;
    font-weight: bold;
    display: inline-block; 
    width: 12px;
    margin-left: -10px;
  }

  /* IDIOMAS (Tres columnas en paralelo abajo) */
  .languages-container {
    display: flex;
    justify-content: space-between;
    font-size: 9.5pt;
  }

  .lang-item {
    width: 30%;
  }
`;
