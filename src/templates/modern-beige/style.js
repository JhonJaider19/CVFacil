export const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #333333;
    font-size: 11pt;
    line-height: 1.4;
    background-color: #ffffff;
  }

  /* Contenedor Principal de 2 Columnas */
  .cv-container {
    display: flex;
    min-height: 297mm; /* Altura proporcional a una hoja A4 */
    width: 100%;
  }

  /* BARRA LATERAL (Izquierda) */
  .sidebar {
    width: 35%;
    background-color: #f5f0eb; /* Color beige de la imagen */
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #5c4d46; /* Tono marrón oscuro para los textos del sidebar */
  }

  .profile-photo-container {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 25px;
  }

  .profile-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-name {
    font-size: 20pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 1px;
    line-height: 1.2;
    margin-bottom: 40px;
    color: #5c4d46;
  }

  .sidebar-section {
    width: 100%;
    margin-bottom: 30px;
    text-align: center;
  }

  .sidebar-title {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 15px;
    color: #5c4d46;
    border-bottom: 1px solid rgba(92, 77, 70, 0.2);
    padding-bottom: 5px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9.5pt;
    margin-bottom: 8px;
    word-break: break-all;
  }

  .sidebar-list-item {
    font-size: 10pt;
    margin-bottom: 6px;
  }

  /* COLUMNA PRINCIPAL (Derecha) */
  .main-content {
    width: 65%;
    padding: 40px 30px;
    background-color: #ffffff;
  }

  .content-section {
    margin-bottom: 25px;
    page-break-inside: avoid; /* Evita que se corte un bloque entre páginas */
  }

  .section-title {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #8c6d58; /* Color marrón cobrizo de los títulos de la imagen */
    letter-spacing: 1px;
    margin-bottom: 12px;
    border-bottom: 1px solid #e0dcd8;
    padding-bottom: 3px;
  }

  .profile-text {
    font-size: 10pt;
    text-align: justify;
    color: #444444;
  }

  /* Estilos de Bloques de Experiencia/Educación */
  .history-item {
    margin-bottom: 15px;
    page-break-inside: avoid;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .item-title {
    font-size: 10.5pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #333333;
  }

  .item-subtitle {
    font-size: 10pt;
    font-weight: 500;
    color: #666666;
  }

  .item-date-location {
    font-size: 9pt;
    color: #888888;
    margin-bottom: 5px;
  }

  .history-item ul {
    margin-left: 15px;
    font-size: 9.5pt;
    color: #444444;
  }

  .history-item li {
    margin-bottom: 4px;
  }
`;
