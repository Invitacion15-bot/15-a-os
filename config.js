/* =====================================================================
   CONFIGURACIÓN DE LA INVITACIÓN — edita SOLO este archivo
   ---------------------------------------------------------------------
   Todo lo que ven los invitados sale de aquí. Cambia los valores entre
   comillas, guarda y vuelve a publicar. Los datos marcados con
   «DEMO» son de demostración y DEBEN reemplazarse antes de enviar.
   ===================================================================== */
window.INVITACION = {

  // true muestra la cinta «Vista de demostración». Pon false al publicar.
  demo: true,

  // ---------------- Quinceañera ----------------
  nombre: "Cecilia",                 // nombre como aparece en la portada
  nombreCompleto: "Cecilia",         // se usa en el mensaje de WhatsApp

  // ---------------- Evento ----------------
  // Fecha y hora en formato ISO con zona horaria de Colombia (-05:00).
  fechaHoraISO: "2026-12-12T20:00:00-05:00",          // DEMO
  fechaTexto: "Sábado 12 de diciembre de 2026",       // DEMO
  horaTexto: "8:00 p. m.",                            // DEMO
  horaFin: "2:00 a. m.",                              // DEMO (deja "" para ocultar)
  codigoVestimenta: "Formal · toques plateados y brillantes",

  lugar: {
    nombre: "Salón de eventos (dirección de ejemplo)",           // DEMO
    direccion: "Plaza de Bolívar, Cra. 7 #11-10, Bogotá",       // DEMO
    // Coordenadas exactas (en Google Maps: clic derecho sobre el lugar → copiar coordenadas)
    lat: 4.598056,                                             // DEMO
    lng: -74.075833                                            // DEMO
  },

  // ---------------- Mensajes ----------------
  frasePortada: "Mis XV años",
  mensaje:
    "¡Hoy comienza un capítulo lleno de magia en mi vida, y no sería lo mismo sin ti!\n" +
    "Te espero para celebrar mis XV años en una noche inolvidable. " +
    "¡Es mi fiesta, es mi día y lo quiero compartir contigo!",

  // ---------------- WhatsApp de los organizadores ----------------
  // Solo dígitos, con indicativo de país (57 = Colombia). Sin +, espacios ni guiones.
  whatsapp: "573000000000",                                     // DEMO
  fechaLimiteConfirmacion: "30 de noviembre de 2026",          // DEMO ("" para ocultar)

  // ---------------- Fotografías ----------------
  // Pon tus fotos en la carpeta img/ (JPG o WEBP de máx. 1600 px de ancho y < 400 KB)
  fotos: [
    { src: "img/foto-1.svg", alt: "Cecilia — foto 1" },
    { src: "img/foto-2.svg", alt: "Cecilia — foto 2" },
    { src: "img/foto-3.svg", alt: "Cecilia — foto 3" }
  ],

  // ---------------- Música ----------------
  // archivo: ruta a un MP3 propio (ej. "musica/quinceanera.mp3"). Usa un archivo
  // que tengas derecho a reproducir. Si lo dejas vacío suena una melodía
  // ambiental generada por la página.
  musica: {
    archivo: "",
    titulo: "Melodía de la noche"
  },

  // ---------------- Invitados y cupos ----------------
  // Cada invitado recibe su enlace propio:  https://TU-SITIO/#codigo
  // El cupo es el número máximo de personas que puede confirmar.
  // Si alguien abre el enlace sin código, se usa cupoGeneral.
  cupoGeneral: 1,
  invitados: [
    { codigo: "familia-garcia", nombre: "Familia García", cupo: 4 },   // DEMO
    { codigo: "laura-mendez",   nombre: "Laura Méndez",   cupo: 1 },   // DEMO
    { codigo: "pareja-rojas",   nombre: "Andrés y Sofía", cupo: 2 },   // DEMO
    { codigo: "familia-torres", nombre: "Familia Torres", cupo: 3 }    // DEMO
  ],

  // ---------------- Registro central de confirmaciones (opcional) ----------------
  // Gratis con Supabase. Ver README → «Registro de confirmaciones».
  // Si queda vacío, las confirmaciones llegan solo por WhatsApp.
  supabase: {
    url: "",       // ej. "https://abcdxyz.supabase.co"
    anonKey: ""    // clave «anon public» del proyecto
  },

  // ---------------- Colores y tipografías ----------------
  colores: {
    noche: "#170e17",       // fondo
    ciruela: "#2b1a2a",     // superficies
    rosa: "#e8b4b8",        // rosa empolvado
    dorado: "#d4af6a",
    champagne: "#f3e5c8",
    plata: "#c9ccd6"
  },
  // Nombres exactos de Google Fonts
  tipografias: {
    nombre: "Pinyon Script",          // nombre de la quinceañera
    titulos: "Cormorant Garamond",    // títulos
    texto: "Jost"                     // texto general
  }
};
