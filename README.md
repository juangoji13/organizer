# organizer

> Sistema de organización y gestión para trabajos personales y proyectos de clientes.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`)
- **Despliegue & Hosting**: [Vercel](https://vercel.com/)
- **PWA**: Web App Manifest nativo (`src/app/manifest.ts`) y Service Worker (`public/sw.js`)

---

## 📁 Estructura del Proyecto

```text
organizer/
├── public/                     # Archivos estáticos y Service Worker PWA
│   ├── sw.js                   # Service Worker para caché y soporte offline
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Estilos globales y Tailwind CSS v4
│   │   ├── layout.tsx          # Root Layout con viewport y registro PWA
│   │   ├── manifest.ts         # Generador nativo de manifest PWA
│   │   └── page.tsx            # Página inicial de estado y bienvenida
│   ├── components/
│   │   └── pwa/
│   │       └── pwa-register.tsx # Componente cliente para registro de SW
│   ├── lib/
│   │   ├── supabase/           # Utilidades de conexión Supabase
│   │   │   ├── client.ts       # Cliente para componentes del navegador
│   │   │   ├── server.ts       # Cliente para Server Components y Actions
│   │   │   └── middleware.ts   # Helper para refresco de sesión en cookies
│   │   └── utils.ts            # Utilidades de clases (clsx + tailwind-merge)
│   ├── middleware.ts           # Middleware de Next.js para sesión de Supabase
│   └── types/
│       └── database.types.ts   # Tipos TypeScript para Supabase
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Reglas de exclusión de Git
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Inicio Rápido

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/juangoji13/organizer.git
cd organizer
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y añade tus credenciales de Supabase:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ⚡ Despliegue en Vercel

El proyecto está vinculado al proyecto `organizer` en Vercel:

```bash
# Despliegue de preview
vercel

# Despliegue a producción
vercel --prod
```

En el panel de Vercel (Project Settings &rarr; Environment Variables), añade:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📐 Convenciones de Git & Ramas

### Estructura de Commits (Conventional Commits)

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit:
- `feat`: Nuevas funcionalidades
- `fix`: Solución de errores o bugs
- `docs`: Documentación
- `style`: Estilos y formato sin cambio en funcionalidad
- `refactor`: Refactorización o mejora interna de código
- `test`: Pruebas unitarias o de integración
- `perf`: Mejoras de rendimiento
- `chore`: Mantenimiento y tareas rutinarias
- `BREAKING CHANGE (!)`: Cambios que rompen compatibilidad

### Estrategia de Ramas

#### Ramas Permanentes
- `main`: Rama de producción.
- `dev`: Rama de desarrollo continuo.
- `test`: Rama para pruebas de QA.
- `staging`: Rama opcional para validación antes de producción.

#### Ramas Temporales
- `feature/<nombre>`: Desarrollo de nuevas funciones.
- `bugfix/<nombre>`: Corrección de fallos detectados tras un sprint o demo.
- `hotfix/<nombre>`: Parche urgente directamente aplicable a producción.
- `experimental/<nombre>`: Pruebas de concepto e investigación.
- `merge/<nombre>`: Resolución de conflictos complejos.
