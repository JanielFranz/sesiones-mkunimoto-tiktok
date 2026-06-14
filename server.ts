import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { Testimonial, Booking, RoadmapResponse, ProfileReviewResponse } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for dynamic features
const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Diego Solis",
    role: "Aspirante a Ing. de Software",
    text: "¡La sesión fue clave! Tenía muchas dudas de si cambiarme a sistemas desde administración. Kuni me ayudó a armar mi primer plan de estudio pragmático. Acabo de empezar a codear en React hoy mismo.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
    date: "Ayer",
    isStudent: true
  },
  {
    id: "t2",
    name: "Milagros Huamán",
    role: "Estudiante de 2do ciclo",
    text: "En la universidad te enseñan mucha matemática pero poco sobre cómo crear proyectos reales. La revisión de portafolio que hicimos con Kuni me abrió los ojos sobre lo que busca la industria.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    date: "Hace 4 días",
    isStudent: true
  },
  {
    id: "t3",
    name: "Jean Pierre Flores",
    role: "4to Sec. (Futuro Techie)",
    text: "La mejor S/ 30 invertidos de mi vida. Me dio un panorama súper realizado y amigable de qué hace un Programador en el día a día. Decidido al 100% que estudiaré Ing de Software en la UNI.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    date: "Hace 1 semana",
    isStudent: true
  }
];

const bookings: Booking[] = [];
const pendingTestimonials: Testimonial[] = [];

// Secure connection to Gemini API
let aiClient: GoogleGenAI | null = null;
const isGeminiEnabled = !!process.env.GEMINI_API_KEY;

if (isGeminiEnabled) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("✅ Gemini client initialized successfully with API key.");
  } catch (err) {
    console.error("❌ Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("⚠️ No process.env.GEMINI_API_KEY found. Server will run on mock fallback mode for AI features.");
}

// 1. Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    geminiActive: isGeminiEnabled,
    environment: process.env.NODE_ENV || "development"
  });
});

// 2. Booking Endpoints
app.post("/api/bookings/create", (req, res) => {
  try {
    const { name, email, discordId, date, timeSlot, motive, customDetails } = req.body;
    if (!name || !email || !date || !timeSlot || !motive) {
      return res.status(400).json({ error: "Faltan campos requeridos para la reserva." });
    }

    const code = `KUNI-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: Booking = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      discordId,
      date,
      timeSlot,
      motive,
      customDetails: customDetails || "",
      status: "confirmed",
      code
    };

    bookings.push(newBooking);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Fallo interno al procesar tu reserva." });
  }
});

// 3. Testimonials Endpoints
app.get("/api/testimonials", (req, res) => {
  res.json(testimonials);
});

app.post("/api/testimonials/add", (req, res) => {
  try {
    const { name, role, text, rating, isStudent } = req.body;
    if (!name || !role || !text || !rating) {
      return res.status(400).json({ error: "Faltan datos del testimonio" });
    }

    const avatars = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"
    ];

    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newTestimonial: Testimonial = {
      id: Math.random().toString(36).substring(7),
      name,
      role,
      text,
      rating: Number(rating),
      avatar: randomAvatar,
      date: "Hace unos instantes",
      isStudent: !!isStudent
    };

    pendingTestimonials.unshift(newTestimonial);
    res.status(201).json({ status: "moderation", data: newTestimonial });
  } catch (error) {
    console.error("Testimonials error:", error);
    res.status(500).json({ error: "Error agregando el testimonio" });
  }
});

// 4. AI Endpoint - Roadmap Builder
app.post("/api/gemini/roadmap", async (req, res) => {
  try {
    const { currentStage, dreamRole, experienceYears, mainDoubt } = req.body;
    if (!currentStage || !dreamRole) {
      return res.status(400).json({ error: "Faltan parámetros requeridos: 'currentStage' o 'dreamRole'." });
    }

    // Friendly Spanish stages & roles mapping for prompt context
    const stageNames: Record<string, string> = {
      secundaria: "Estudiante de colegio (4to/5to de secundaria) descubriendo desarrollo de software",
      universidad_inicial: "Estudiante de universidad/instituto en ciclos iniciales (1er/2do ciclo)",
      universidad_final: "Estudiante avanzado o egresado de informática buscando su primer empleo",
      reconversion: "Profesional de otra área queriendo hacer reconversión de carrera técnica (Futuro techie)"
    };

    const roleNames: Record<string, string> = {
      frontend: "Desarrollo Front-End (Creación de interfaces web atractivas con React / Tailwind)",
      backend: "Desarrollo Back-End (Modelado de bases de datos, APIs robustas con Node/Express o Python)",
      datascience: "Ciencia de Datos y Análisis (Manejo de datos complejos, visualizaciones, Python/SQL)",
      ia_engineer: "Ingeniería de Inteligencia Artificial (Integración de modelos, Prompts, RAG y Agentes inteligentes con Python/TypeScript)",
      mobile: "Desarrollo de Aplicaciones Móviles (Creación de apps en Flutter, React Native o nativo)",
      game: "Desarrollo de Videojuegos (Fundamentos de motores como Unity o Godot y C#)"
    };

    const targetStageText = stageNames[currentStage] || currentStage;
    const targetRoleText = roleNames[dreamRole] || dreamRole;

    const kuniPromptText = `Eres Kuni, un mentor tech entusiasta, empático y muy directo de Perú. Quieres guiar a un estudiante/interesado que se encuentra en la etapa: "${targetStageText}", cuyo objetivo es llegar al rol de: "${targetRoleText}". Tiene ${experienceYears || "0"} años de experiencia tech y su principal bloqueo/duda es: "${mainDoubt || "No sabe por dónde empezar de forma pragmática"}".
Arma un plan de estudio y de acción directo de 3 pasos lógicos y prácticos. Habla en un tono sumamente humano, motivador, con pizcas de modismos peruanos pero totalmente profesionales (como usar 'crack', 'pata', 'manya', 'darle con fe', 'asumir el reto', etc.), como si le estuvieras hablando en una cafetería como un 'amigo experto'.
No uses tecnicismos exagerados, concéntrate en metodologías reales de portafolio y proyectos reales en vez de teoría pesada.

Genera el resultado en formato JSON estructurado respetando estrictamente este esquema:
{
  "roleName": "Título del perfil sugerido",
  "summary": "Resumen directo de tu análisis de su situación (máximo 100 palabras) en primera persona (ej. '¡Hola crack! Analicé tu caso...')",
  "steps": [
    {
      "title": "Paso 1: [Título corto y potente]",
      "duration": "Sugerencia de tiempo (ej. Mes 1 al 2)",
      "description": "Explicación breve de lo que debe hacer y dominar aquí",
      "skillsToLearn": ["habilidad 1", "herramienta 2", "concepto 3"],
      "kuniTip": "Un consejo de oro totalmente personalizado, directo y con tu firma de mentor motivador."
    },
    ... (deben ser exactamente 3 pasos)
  ],
  "kuniFinalAdvice": "Mensaje final inspirador de Kuni para motivar a emprender este viaje ahora mismo con confianza."
}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: kuniPromptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              roleName: { type: Type.STRING },
              summary: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    description: { type: Type.STRING },
                    skillsToLearn: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    kuniTip: { type: Type.STRING }
                  },
                  required: ["title", "duration", "description", "skillsToLearn", "kuniTip"]
                }
              },
              kuniFinalAdvice: { type: Type.STRING }
            },
            required: ["roleName", "summary", "steps", "kuniFinalAdvice"]
          }
        }
      });

      const text = response.text || "{}";
      const parsed: RoadmapResponse = JSON.parse(text.trim());
      return res.json({ source: "gemini-api", data: parsed });
    } else {
      // Mock Fallback Simulation with outstanding content matching custom Peruvian developer Kuni's persona
      const mockRoadmap: RoadmapResponse = {
        roleName: targetRoleText,
        summary: `¡Hola crack! Un gusto conocerte. Veo que estás como ${targetStageText} y apuntas a ${targetRoleText}. Tu principal duda ("${mainDoubt || "Sin rumbo inicial"}") es súper común en nuestro medio, no te paltees. Estudiar tecnología es como armar un lego: necesitas las bases correctas antes de colgarlo en tu sala. Aquí te armé un plan recontra práctico de 3 etapas para que la rompas sin perder tiempo en teoría innecesaria. ¡Vamos con todo!`,
        steps: [
          {
            title: "Fase 1: Construcción de Cimientos y Lógica Práctica",
            duration: "Mes 1",
            description: "No te lances a frameworks avanzados todavía. Domina la lógica de programación pura y el control de versiones, que es lo que todo junior necesita.",
            skillsToLearn: ["Git & GitHub para subir proyectos", "Algoritmos y variables lógicas", "HTML, CSS básico y JavaScript esencial"],
            kuniTip: "Tip de Kuni: No estudies de memoria, crack. Intenta romper el código. Crea una página web estúpida pero divertida para un amigo tuyo. Ahí es donde realmente entiendes Web."
          },
          {
            title: "Fase 2: Dominar el Core del Área Elegida",
            duration: "Meses 2 al 3",
            description: "Empieza a enfocarte en construir APIs si vas por backend, o componentes con React si vas por front-end. Agrega interacción real.",
            skillsToLearn: ["Frontend: React & Tailwind CSS", "Backend: Express o Python Fast API", "Hacer llamadas de datos (Fetch/Axios)"],
            kuniTip: "Tip de Kuni: Crea un clon simplificado de alguna aplicación que uses todos los días (ej. un mini Twitter o Spotify). Ponlo en tu portafolio de GitHub de inmediato."
          },
          {
            title: "Fase 3: Portafolio de Proyecto Único y Pitch Profesional",
            duration: "Mes 4",
            description: "Prepara tus redes. Los reclutadores compran con los ojos. Necesitas mostrar un despliegue real en la nube, no solo proyectos que corren en tu localhost.",
            skillsToLearn: ["Despliegue en Cloud (Mención especial a Vercel o Render)", "LinkedIn optimizado con palabras clave", "Habilidades de comunicación y resolución técnica"],
            kuniTip: "Tip de Kuni: Entrar al sector tech no es solo saber programar; es saber explicar qué hiciste y por qué tomaste tales decisiones de desarrollo. ¡La actitud lo es todo, crack!"
          }
        ],
        kuniFinalAdvice: "Recuerda que todos empezamos desde cero con una pantalla negra y mil errores que no entendíamos. Reserva una sesión conmigo si experimentas bloqueos o si quieres que revisemos este plan a detalle. ¡Te veo pronto en la cancha tech peruana!"
      };

      return res.json({ source: "simulado-local", data: mockRoadmap });
    }
  } catch (error) {
    console.error("Roadmap generation error:", error);
    res.status(500).json({ error: "Fallo al generar el plan de carrera con Inteligencia Artificial." });
  }
});

// 5. AI Endpoint - Profile Grader (LinkedIn headline / CV Summary reviewer)
app.post("/api/gemini/grade-profile", async (req, res) => {
  try {
    const { profileText, type } = req.body;
    if (!profileText) {
      return res.status(400).json({ error: "Por favor proporciona un extracto o titular para analizar." });
    }

    const reviewTypeLabel = type === "linkedin" ? "Titular / Extracto de LinkedIn" : "Resumen del perfil del CV";

    const promptText = `Eres Kuni, un mentor tech de mente ágil que vive de primera mano los procesos de reclutamiento de software actuales. Tu misión es evaluar y calificar un fragmento de perfil profesional tech (en este caso es: ${reviewTypeLabel}):
===
${profileText}
===
Evalúa de manera realista pero extremadamente constructiva.
Danos un puntaje de impacto de 0 a 100, donde:
- Menos de 40: Muy genérico ("estudiante entusiasta", sin foco técnico real, "buscando oportunidades").
- 40 a 70: Bueno, pero falta diferenciar tecnología, métricas de impacto u objetivos.
- Más de 70: Excelente, describe valor, stack clave y qué problema resuelve.

Debe dar un JSON con este esquema estructurado:
{
  "score": [Número de 0 a 100],
  "positives": [Lista de 2 a 3 puntos específicos buenos del texto original (en español)],
  "negatives": [Lista de 2 a 3 puntos específicos débiles o que aburren a los reclutadores (en español)],
  "suggestedRewrites": [
    {
      "title": "[Alternativa 1: Enfoque Pragmático/Stack]",
      "description": "Una propuesta de titular corta e impactante",
      "summary": "Una versión de extracto/resumen un poquito más larga (máximo 2 líneas) ideal para complementar",
      "rationale": "Breve explicación de por qué esta versión funciona mejor"
    },
    {
      "title": "[Alternativa 2: Enfoque de Solución de Negocio/Impacto]",
      "description": "Una propuesta alternativa enfocada en aportes reales",
      "summary": "Una versión de extracto/resumen con enfoque de negocio",
      "rationale": "Explicación de este enfoque"
    }
  ],
  "kuniFeedback": "Mensaje en tu propia voz amigable y peruana de mentor tech para inspirarlo a cambiar el enfoque del perfil directamente."
}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              positives: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              negatives: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedRewrites: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    rationale: { type: Type.STRING }
                  },
                  required: ["title", "description", "summary", "rationale"]
                }
              },
              kuniFeedback: { type: Type.STRING }
            },
            required: ["score", "positives", "negatives", "suggestedRewrites", "kuniFeedback"]
          }
        }
      });

      const text = response.text || "{}";
      const parsed: ProfileReviewResponse = JSON.parse(text.trim());
      return res.json({ source: "gemini-api", data: parsed });
    } else {
      // High-quality mock fallback simulation matching Spanish/Peruvian tech Kuni's review persona
      const originalLength = profileText.trim().length;
      let calculatedScore = 55;
      if (profileText.toLowerCase().includes("estudiante de") || profileText.toLowerCase().includes("bachiller")) {
        calculatedScore = 48;
      }
      if (profileText.toLowerCase().includes("buscando") || profileText.toLowerCase().includes("proactivo")) {
        calculatedScore -= 10;
      }
      if (profileText.toLowerCase().includes("clon") || profileText.toLowerCase().includes("github") || profileText.toLowerCase().includes("react")) {
        calculatedScore += 15;
      }
      calculatedScore = Math.max(10, Math.min(98, calculatedScore));

      const mockReview: ProfileReviewResponse = {
        score: calculatedScore,
        positives: [
          "Mencionas tu situación académica o tu carrera de origen con honestidad.",
          "Se nota tu alta disposición para el autoaprendizaje y para integrarte a equipos tech."
        ],
        negatives: [
          "Usas palabras vacías de relleno como 'proactivo', 'responsable' o 'apasionado' que no dicen nada concreto.",
          "Falta un 'gancho de stack técnico': un reclutador no sabe de inmediato si manejas JavaScript, Base de datos o si eres un generalista teórico."
        ],
        suggestedRewrites: [
          {
            title: "Opción 1: Centrado en Stack Técnico & Proyectos",
            description: "Desarrollador de Software en Formación | Especializado en React, Node.js y Git | Creador de Clones de Aplicaciones Reales",
            summary: "Estudiante de ingeniería apasionado en construir software usable. He desarrollado portafolios interactivos y despliegues consumiendo APIs públicas. No solo estudio la teoría, me gusta poner a prueba mi código en producción.",
            rationale: "Filtra directamente por palabras clave que los reclutadores buscan en LinkedIn o filtros ATS (React, Node, Git)."
          },
          {
            title: "Opción 2: Enfocado a la Acción y Valor Humano",
            description: "Estudiante de Ing. de Software enfocado en Ingeniería de Frontend | React, Tailwind & ES6 | Construyendo el futuro de la web",
            summary: "Concentro mi energía en crear interfaces web rápidas, accesibles y estéticamente limpias. Busco sumarme a proyectos complejos para aportar con código ordenado y habilidades comunicativas.",
            rationale: "Destaca tu enfoque de aporte práctico, perfecto para pasantías tech o roles junior de alta sinergia."
          }
        ],
        kuniFeedback: `¡Oye crack! Un puntaje de ${calculatedScore}/100 no está mal, pero hay un egg de oportunidades de mejora. Deja de presentarte solo como un 'estudiante proactivo'. En tecnología, todos buscan proactivos. Lo que te va a diferenciar es decir: "Sé armar esto de forma práctica usando tal tecnología y lo puedes ver en mi GitHub". Ese cambio de chip hará que te busquen a ti. ¡Anímate a usar alguna de las opciones que te recomendé y prueba la diferencia!`
      };

      return res.json({ source: "simulado-local", data: mockReview });
    }
  } catch (error) {
    console.error("Profile grading error:", error);
    res.status(500).json({ error: "Fallo al graduar tu perfil profesional con IA." });
  }
});

// 6. Vite config / Static file hosting routing
const isProd = process.env.NODE_ENV === "production";

async function setupFrontend() {
  if (!isProd) {
    console.log("🛠️ Starting Vite Dev Server bridge...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`📦 Serving static compiled build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Kuni Mentorship server listening on http://0.0.0.0:${PORT}`);
  });
}

setupFrontend();
