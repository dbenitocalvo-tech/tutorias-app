# Guía para montar la app de Tutorías en tu computadora

Esta guía te lleva de cero a tener la aplicación corriendo en tu computadora,
conectada a tu base de datos de Supabase, y luego publicada en internet.

No necesitas saber programar. Solo sigue los pasos en orden. Tómate tu tiempo.

---

## Resumen de lo que vas a hacer

1. Correr un SQL en Supabase (crea la tabla donde se guarda todo).
2. Instalar Node.js (el motor que necesita la app).
3. Abrir el proyecto y arrancarlo en tu computadora.
4. (Opcional pero recomendado) Publicarlo en internet con Vercel, gratis.

---

## PASO 1 — Preparar la base de datos (5 minutos)

1. Entra a tu proyecto en https://supabase.com
2. En el menú de la izquierda abre **SQL Editor**.
3. Abre el archivo `ajuste-supabase-pin.sql` que te entregué, copia TODO su
   contenido y pégalo en el recuadro.
4. Presiona **Run** (o Ctrl/Cmd + Enter).
5. Debe aparecer "Success. No rows returned". Listo.

> Esto crea una tabla llamada `app_estado`. Ahí se guarda toda la información
> de tu sistema (tutores, alumnos, clases, dinero, etc.) en la nube.

---

## PASO 2 — Instalar Node.js (10 minutos, solo una vez)

Node.js es el programa que hace funcionar la app. Se instala una sola vez.

1. Ve a https://nodejs.org
2. Descarga la versión que diga **LTS** (es la estable y recomendada).
3. Abre el instalador y dale "Siguiente" a todo hasta terminar.
4. Para comprobar que quedó bien instalado:
   - En **Windows**: abre el menú Inicio, escribe `cmd` y abre "Símbolo del sistema".
   - En **Mac**: abre la app "Terminal" (búscala con Spotlight: Cmd + Espacio, escribe "Terminal").
   - En esa ventana negra escribe lo siguiente y presiona Enter:
     ```
     node --version
     ```
   - Si te muestra un número (por ejemplo `v20.11.0`), quedó instalado. 

---

## PASO 3 — Poner el proyecto en tu computadora

1. Descarga la carpeta del proyecto (`tutorias-app`) que te entregué y
   descomprímela en un lugar fácil de encontrar, por ejemplo en tu Escritorio.
2. Abre la ventana de comandos (la misma del paso anterior: `cmd` en Windows
   o "Terminal" en Mac).
3. Tienes que "entrar" a la carpeta del proyecto con el comando `cd`. Lo más
   fácil: escribe `cd ` (con un espacio al final) y luego **arrastra la carpeta
   `tutorias-app` a la ventana** y suéltala; se pegará la ruta sola. Presiona Enter.

   Debe verse algo así (la ruta variará según dónde la pusiste):
   ```
   cd C:\Users\Diego\Desktop\tutorias-app      (Windows)
   cd /Users/Diego/Desktop/tutorias-app        (Mac)
   ```

4. Ahora instala las piezas que la app necesita. Escribe:
   ```
   npm install
   ```
   Presiona Enter y espera (puede tardar 1-3 minutos; aparecerá mucho texto,
   es normal). Cuando termine y vuelva a aparecer la línea para escribir, sigue.

5. Crea el archivo de configuración: copia `.env.example` y renómbralo a
   `.env` (en la misma carpeta). Ábrelo con el Bloc de notas y pon ahí la
   URL y la "anon key" de tu proyecto de Supabase (Project Settings → API
   en supabase.com). Sin este archivo la app no arranca.

---

## PASO 4 — Arrancar la app en tu computadora

1. En la misma ventana, escribe:
   ```
   npm run dev
   ```
2. Aparecerá un mensaje con una dirección local, algo como:
   ```
   ➜  Local:   http://localhost:5173/
   ```
3. Abre esa dirección (`http://localhost:5173`) en tu navegador (Chrome, etc.).
4. ¡Ahí está tu app! La primera vez te pedirá crear la cuenta de coordinador
   (nombre + PIN). Todo lo que registres se guarda en Supabase, en la nube.

> Para apagar la app: en la ventana de comandos presiona Ctrl + C.
> Para volver a encenderla otro día: abre la ventana, entra a la carpeta con
> `cd` (paso 3.3) y escribe `npm run dev` de nuevo. No repitas `npm install`.

---

## ¿Cómo entran tus tutores?

Mientras corras la app solo con `npm run dev`, funciona únicamente en TU
computadora. Para que tus tutores entren desde sus teléfonos, necesitas
publicarla en internet (el paso 5). Una vez publicada, todos entran a la misma
dirección con su nombre y PIN, y todo se sincroniza por la base de datos.

---

## PASO 5 — Publicar en internet, gratis (recomendado)

La forma más sencilla es con **Vercel**:

1. Crea una cuenta gratis en https://vercel.com (puedes entrar con tu correo
   de Google).
2. La forma más cómoda de subirlo es a través de GitHub:
   - Crea una cuenta gratis en https://github.com
   - Sube la carpeta `tutorias-app` a un repositorio nuevo (GitHub tiene un
     botón "Add file" → "Upload files" donde puedes arrastrar la carpeta).
   - En Vercel, elige "Add New Project", conecta tu GitHub y selecciona ese
     repositorio.
3. Vercel detecta solo que es un proyecto Vite. Antes de presionar "Deploy",
   abre la sección **Environment Variables** y agrega estas dos (los mismos
   valores que pusiste en tu archivo `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Presiona **Deploy**. En 1-2 minutos te dará una dirección pública (por
   ejemplo `https://tutorias-tuusuario.vercel.app`). Esa es la que compartes
   con tus tutores.

> Nota: si más adelante cambias la URL o la "anon key" en Supabase, recuerda
> actualizar también estas dos variables en Vercel (Project Settings →
> Environment Variables) y volver a desplegar.

---

## Cosas importantes que debes saber

- **Tus datos ya viven en la nube.** Si abres la app desde tu computadora y
  desde el celular de un tutor, ambos ven la misma información. Si se borra el
  navegador o se cambia de equipo, los datos NO se pierden (están en Supabase).

- **Lo único local es la sesión.** El "quién está conectado" se guarda en cada
  dispositivo; por eso cada quien inicia sesión en el suyo.

- **Seguridad (Opción A).** Como decidimos usar PIN, la separación entre
  coordinador y tutor la maneja la app. Es adecuado para un equipo de confianza.
  Si más adelante quieres una seguridad más fuerte (correo + contraseña con
  candados a nivel de base de datos), se puede migrar sin rehacer todo.

- **Respaldos.** Supabase guarda tu información, pero conviene que de vez en
  cuando, desde el Table Editor de Supabase, exportes la tabla `app_estado`
  como respaldo. También el plan gratuito de Supabase pausa proyectos sin uso
  por varios días; basta con volver a entrar al panel para reactivarlo.

---

## Si algo sale mal

- **"npm no se reconoce" / "command not found":** Node.js no quedó instalado o
  hay que cerrar y volver a abrir la ventana de comandos. Repite el Paso 2.
- **La app abre pero dice "No se pudo conectar":** revisa que corriste el SQL
  del Paso 1, y que tu archivo `.env` tiene tu URL y tu "anon key" correctas.
- **Pantalla en blanco con un error de "Faltan las variables de entorno":**
  no creaste el archivo `.env` (Paso 3.5) o lo creaste con otro nombre. Tiene
  que llamarse exactamente `.env`.
- **Pantalla en blanco:** abre la consola del navegador (tecla F12, pestaña
  "Console") y cópiame el mensaje de error; con eso lo resolvemos.

Cuando lo tengas corriendo, o si te atoras en cualquier paso, cuéntame en qué
punto vas y seguimos desde ahí.
