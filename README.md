# Invitación XV años — Cecilia

Es una página web estática. No necesita instalar nada y se publica gratis.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `config.js` | **El único archivo que tienes que editar**: nombre, fecha, hora, lugar, WhatsApp, fotos, música, invitados, colores y tipografías |
| `index.html` | La estructura de la página |
| `styles.css` | El diseño |
| `app.js` | La lógica (música, galería, cuenta regresiva, mapas, confirmación) |
| `img/` | Las fotos. Las 3 que trae son ilustraciones de ejemplo |
| `musica/` | Aquí va tu archivo MP3 |
| `supabase.sql` | Opcional: guardar las confirmaciones en una base de datos gratuita |

## 1. Personalizar (antes de publicar)

1. Abre `config.js` con el Bloc de notas o VS Code.
2. Cambia todos los valores marcados como `DEMO`: fecha, hora, lugar, dirección, coordenadas, número de WhatsApp e invitados.
3. Fotos: copia las fotos reales a `img/` (en JPG, de máximo 1600 px de ancho y menos de 400 KB cada una; puedes comprimirlas gratis en squoosh.app). Luego cambia las rutas, por ejemplo `{ src: "img/cecilia-1.jpg", alt: "Cecilia" }`.
4. Música: copia el MP3 a `musica/` y escribe la ruta en `musica.archivo`, por ejemplo `"musica/quinceanera.mp3"`. Usa un archivo que tengas derecho a reproducir. Si lo dejas vacío, suena una melodía ambiental que genera la página.
5. Cuando todo esté listo, cambia `demo: true` por `demo: false` para quitar la cinta «Vista de demostración».

**Coordenadas:** abre Google Maps, haz clic derecho sobre el salón y haz clic en los números que aparecen arriba para copiarlos. El primero es `lat` y el segundo es `lng`.

## 2. Publicar gratis en GitHub Pages (recomendado, sin costos ni vencimiento)

1. Crea una cuenta gratuita en https://github.com.
2. Haz clic en **New repository**, ponle el nombre `invitacion-xv`, márcalo como **Public** y haz clic en **Create repository**.
3. Haz clic en **uploading an existing file**, arrastra **todo el contenido** de esta carpeta (no la carpeta en sí) y haz clic en **Commit changes**.
4. Ve a **Settings → Pages**. En *Branch* elige `main` y `/ (root)`, y haz clic en **Save**.
5. En uno o dos minutos aparece tu enlace: `https://TU-USUARIO.github.io/invitacion-xv/`

Para hacer cambios después, edita el archivo en GitHub (ícono del lápiz) y guárdalo. El enlace se actualiza solo.

**Alternativa: Netlify.** Crea una cuenta gratuita en https://app.netlify.com, entra a **Add new site → Deploy manually** y arrastra la carpeta. Te da un enlace del tipo `https://nombre.netlify.app`.

## 3. Enlaces por invitado (control de cupos)

Cada invitado o familia recibe su propio enlace, con su código al final:

```
https://TU-USUARIO.github.io/invitacion-xv/#familia-garcia   → cupo de 4
https://TU-USUARIO.github.io/invitacion-xv/#laura-mendez     → cupo de 1
```

- Los códigos y cupos se definen en `config.js → invitados`, o en la base de datos si usas Supabase.
- El formulario no deja confirmar más personas de las autorizadas y pide el nombre de cada acompañante.
- Si alguien abre el enlace sin código, se usa `cupoGeneral`.
- Códigos: en minúsculas, sin espacios ni tildes, usa guiones.

## 4. Confirmaciones

**Sin base de datos (lo más simple):** el invitado llena el formulario y se abre WhatsApp con este mensaje ya escrito para el número de los organizadores:

> ¡Hola! Confirmo mi asistencia a los 15 años de Cecilia.
> Invitado principal: … · Personas que asistirán: 3 de 4 autorizadas · Acompañantes: …

**Con registro central (opcional, gratis con Supabase):**

1. Crea una cuenta en https://supabase.com y luego un proyecto nuevo (plan Free).
2. Abre **SQL Editor**, pega el contenido de `supabase.sql` y haz clic en **Run**.
3. Carga tus invitados con el `insert` de ejemplo que está al final del archivo.
4. Ve a **Project Settings → API**, copia la *Project URL* y la clave *anon public*, y pégalas en `config.js → supabase`.
5. Para ver quién confirmó, entra a **Table Editor → resumen_confirmaciones**.

Con Supabase, el cupo se valida en el servidor (la función `confirmar_asistencia`), así que no se puede saltar aunque alguien modifique la página. Cada invitación personal guarda una sola respuesta: si el invitado vuelve a confirmar, se actualiza la anterior. En el plan gratuito, Supabase pausa los proyectos que pasan una semana sin actividad. Basta con entrar al panel y reactivarlo. Durante las semanas de confirmaciones el proyecto se mantiene activo.

## 5. Antes de enviar: lista de pruebas

- [ ] El enlace abre en Android, en iPhone y en el computador.
- [ ] La música suena al tocar «Abrir invitación» y el botón la pausa y la reanuda. En iPhone, el interruptor de silencio debe estar apagado.
- [ ] «Cómo llegar» abre el lugar correcto.
- [ ] «Confirmar asistencia» abre WhatsApp, con el mensaje, en el número correcto.
- [ ] Un enlace con cupo de 2 no deja elegir 3 personas.
- [ ] Ya no aparece la cinta «Vista de demostración».
