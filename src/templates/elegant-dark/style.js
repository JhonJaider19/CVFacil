export const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Georgia', Times, serif;
    color: #2c3e50;
    font-size: 10.5pt;
    line-height: 1.5;
    background-color: #ffffff;
  }

  /* CABECERA OSCURA (Elegant Dark Header) */
  .dark-header {
    background-color: #1a1a1a; /* Gris oscuro profundo */
    color: #ffffff;
    padding: 40px 50px;
    text-align: center;
    border-bottom: 4px solid #d4af37; /* Línea acento en oro/dorado sutil */
  }

  .dark-header h1 {
    font-size: 26pt;
    font-weight: 400;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 6px;
    color: #ffffff;
  }

  .dark-header .subtitle {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #d4af37; /* Color dorado para el cargo */
    margin-bottom: 15px;
    font-weight: 500;
  }

  .dark-header .contact-grid {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 9pt;
    color: #cccccc;
  }

  /* CUERPO DEL CV */
  .content-body {
    padding: 40px 50px;
  }

  .section {
    margin-bottom: 25px;
    page-break-inside: avoid;
  }

  .section-title {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #1a1a1a;
    letter-spacing: 1px;
    border-bottom: 1px solid #1a1a1a;
    padding-bottom: 3px;
    margin-bottom: 15px;
  }

  .profile-text {
    text-align: justify;
    color: #333333;
    font-size: 10pt;
  }

  /* ELEMENTOS DEL HISTORIAL */
  .item-entry {
    margin-bottom: 16px;
    page-break-inside: avoid;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2px;
  }

  .item-title {
    font-size: 11pt;
    font-weight: bold;
    color: #1a1a1a;
  }

  .item-date {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9pt;
    color: #7f8c8d;
    font-weight: bold;
  }

  .item-subtitle {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9.5pt;
    color: #d4af37; /* Detalles en dorado sutil */
    font-weight: 600;
    margin-bottom: 6px;
  }

  .item-entry ul {
    margin-left: 20px;
    font-size: 9.5pt;
    color: #444444;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  .item-entry li {
    margin-bottom: 4px;
    text-align: justify;
  }

  /* SECCIÓN COMPETENCIAS (Dos columnas abajo) */
  .skills-flex {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  .skills-column {
    width: 48%;
  }

  .skill-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 9.5pt;
    border-bottom: 1px dashed #e0e0e0;
    padding-bottom: 2px;
  }

  .skill-level {
    color: #7f8c8d;
    font-style: italic;
  }
`;
