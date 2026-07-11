import React, { useState } from "react";
import { Sparkles, RefreshCw, CheckCircle, Download, BookOpen, Clock, Compass } from "lucide-react";
import { RoadmapResponse, RoadmapStep } from "../types";

interface RoadmapBuilderProps {
  stageOverride: string | null;
  onScrollTo: (sectionId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos curados por Kuni. Rutas 100% predecibles (sin IA): cada rol tiene una
// ruta base de 3 pasos, y la etapa personaliza el resumen y el consejo final.
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_LABEL: Record<string, string> = {
  secundaria: "estás en el colegio (4to/5to de secundaria)",
  universidad_inicial: "estás en tus primeros ciclos de universidad o instituto",
  reconversion: "estás dando el salto a tech desde otra carrera o rubro"
};

const STAGE_FINAL_ADVICE: Record<string, string> = {
  secundaria:
    "No necesitas esperar a terminar el colegio para arrancar, crack. Con una laptop básica y ganas ya das tus primeros pasos. Si quieres que revisemos tu caso puntual y despejemos dudas de carrera, reserva una sesión 1:1.",
  universidad_inicial:
    "La U te da la teoría; los proyectos reales te dan el trabajo. Empieza tu portafolio desde ya, no esperes a los últimos ciclos. ¿Te sientes bloqueado con algún curso o tecnología? Agenda una sesión y lo destrabamos juntos.",
  reconversion:
    "Cambiar de rubro asusta, pero tus habilidades previas (comunicación, orden, disciplina) son tu ventaja real. Enfócate en construir, no solo en estudiar teoría. Reserva una sesión y armamos tu plan de transición paso a paso."
};

const ROLE_ROADMAPS: Record<string, { roleName: string; steps: RoadmapStep[] }> = {
  frontend: {
    roleName: "Desarrollador Front-End",
    steps: [
      {
        title: "Paso 1: Bases sólidas de la web",
        duration: "Mes 1",
        description:
          "Antes de tocar frameworks, entiende cómo se construye una página de verdad. Aquí formas los cimientos que casi todos se saltan.",
        skillsToLearn: ["HTML5 semántico", "CSS moderno (Flexbox y Grid)", "JavaScript esencial (ES6+)"],
        kuniTip: "No copies-pegues, crack. Recrea una landing de una marca que te guste solo mirándola. Ahí aprendes de verdad."
      },
      {
        title: "Paso 2: React + Tailwind en proyectos reales",
        duration: "Meses 2 al 3",
        description:
          "Da el salto a componentes reutilizables e interfaces dinámicas. Deja de hacer páginas estáticas y empieza a construir apps.",
        skillsToLearn: ["React (componentes, props, hooks)", "Tailwind CSS", "Consumo de APIs con fetch"],
        kuniTip: "Clona una app que uses a diario (un mini Spotify o Twitter). Vale más que 10 tutoriales vistos sin practicar."
      },
      {
        title: "Paso 3: Portafolio desplegado en la nube",
        duration: "Mes 4",
        description:
          "Los reclutadores compran con los ojos. Necesitas 2-3 proyectos en vivo, no solo corriendo en tu localhost.",
        skillsToLearn: ["Git y GitHub", "Despliegue en Vercel", "2-3 proyectos con demo pública"],
        kuniTip: "Cada proyecto debe tener su link en vivo y su repo ordenado. Un README claro dice más que mil palabras."
      }
    ]
  },
  backend: {
    roleName: "Desarrollador Back-End",
    steps: [
      {
        title: "Paso 1: Lógica y tu primer lenguaje",
        duration: "Mes 1",
        description:
          "El back es lógica pura. Elige un lenguaje y domina cómo pensar en problemas antes que en sintaxis.",
        skillsToLearn: ["Lógica de programación", "JavaScript o Python", "Git y GitHub"],
        kuniTip: "Resuelve retos cortos (tipo FizzBuzz o mini-calculadoras) hasta que la lógica te salga natural."
      },
      {
        title: "Paso 2: APIs y bases de datos",
        duration: "Meses 2 al 3",
        description:
          "El corazón del back: exponer datos de forma ordenada y guardarlos bien. Aquí construyes tu primer servidor real.",
        skillsToLearn: ["Node + Express o FastAPI", "APIs REST", "SQL/PostgreSQL o MongoDB"],
        kuniTip: "Construye una API de un tema que te guste (gestión de partidos, recetas, lo que sea). Se aprende mejor con cariño al proyecto."
      },
      {
        title: "Paso 3: Proyecto real desplegado",
        duration: "Mes 4",
        description:
          "Une todo en un servicio funcional, con autenticación básica y documentación, y súbelo a la nube.",
        skillsToLearn: ["Autenticación básica (JWT)", "Despliegue en Render/Railway", "Documentar tu API"],
        kuniTip: "Documenta tu API como si otra persona fuera a usarla mañana. Eso te separa de un junior promedio."
      }
    ]
  },
  datascience: {
    roleName: "Data Dev / Analista de Datos",
    steps: [
      {
        title: "Paso 1: Python y fundamentos de datos",
        duration: "Mes 1",
        description:
          "Todo empieza con Python y con perderle el miedo a los datos. Nada de matemática pesada todavía, pura práctica.",
        skillsToLearn: ["Python", "Pandas y NumPy", "SQL básico"],
        kuniTip: "Baja un dataset gratis de algo que te interese (Spotify, fútbol) y empieza a hacerle preguntas con código."
      },
      {
        title: "Paso 2: Análisis y visualización",
        duration: "Meses 2 al 3",
        description:
          "Aprende a limpiar datos desordenados y a contar historias con gráficos claros. Aquí es donde brillas.",
        skillsToLearn: ["Limpieza de datos", "Matplotlib / Seaborn", "Estadística práctica"],
        kuniTip: "Un buen gráfico responde una pregunta clara. Si tu gráfico no dice nada, sobra."
      },
      {
        title: "Paso 3: Proyecto de análisis de punta a punta",
        duration: "Mes 4",
        description:
          "Toma un problema real, analízalo y presenta conclusiones. Ese notebook ordenado es tu carta de presentación.",
        skillsToLearn: ["Jupyter Notebooks", "Dashboards simples", "Storytelling con datos"],
        kuniTip: "Sube tu análisis a GitHub con conclusiones escritas. No basta el código: muestra qué aprendiste de los datos."
      }
    ]
  },
  ia_engineer: {
    roleName: "IA Engineer",
    steps: [
      {
        title: "Paso 1: Python y bases firmes",
        duration: "Mes 1",
        description:
          "Antes de 'hacer IA' necesitas una base sólida de programación. Sin cimientos, lo demás se cae.",
        skillsToLearn: ["Python", "Lógica y estructuras de datos", "Git y GitHub"],
        kuniTip: "No saltes directo a modelos gigantes. Domina Python primero; te ahorrará meses de frustración."
      },
      {
        title: "Paso 2: Consumir e integrar modelos",
        duration: "Meses 2 al 3",
        description:
          "Hoy la mayoría del trabajo de IA es integrar modelos existentes en aplicaciones útiles, no entrenarlos desde cero.",
        skillsToLearn: ["APIs de modelos y prompting", "RAG básico", "TypeScript o Python para apps"],
        kuniTip: "Un buen prompt es como una buena instrucción a un pata nuevo: claro, con contexto y con ejemplos."
      },
      {
        title: "Paso 3: Construye un producto con IA",
        duration: "Meses 4 al 5",
        description:
          "Arma algo que la gente pueda usar: un chatbot con contexto, un asistente o un agente sencillo, y despliégalo.",
        skillsToLearn: ["Integrar un chatbot o agente", "Despliegue en la nube", "Buenas prácticas de prompts"],
        kuniTip: "Que tu demo resuelva un problema chiquito pero real. Un producto humilde que funciona vale más que uno ambicioso a medias."
      }
    ]
  },
  mobile: {
    roleName: "Desarrollador de Apps Móviles",
    steps: [
      {
        title: "Paso 1: Bases de programación",
        duration: "Mes 1",
        description:
          "Antes de la app, la lógica. Elige el lenguaje según el framework al que apuntes y practica lo esencial.",
        skillsToLearn: ["JavaScript o Dart", "Lógica de programación", "Git y GitHub"],
        kuniTip: "Si dudas entre React Native o Flutter, elige uno y no lo sueltes. Saltar de uno a otro solo te retrasa."
      },
      {
        title: "Paso 2: Tu primer framework móvil",
        duration: "Meses 2 al 3",
        description:
          "Aprende a construir pantallas, navegar entre ellas y conectar tu app a datos externos.",
        skillsToLearn: ["React Native o Flutter", "Componentes y navegación", "Consumo de APIs"],
        kuniTip: "Clona una app simple que ya uses (una lista de tareas o clima). Publicarla en tu celular es una emoción que engancha."
      },
      {
        title: "Paso 3: App publicada en tu portafolio",
        duration: "Mes 4",
        description:
          "Pule tu app, genera el build y muéstrala con un video o demo. Eso convence más que cualquier certificado.",
        skillsToLearn: ["Estado y almacenamiento local", "Generar el build de la app", "Video/demo de la app"],
        kuniTip: "Graba un video corto mostrando tu app funcionando. Los reclutadores aman ver el producto en acción."
      }
    ]
  },
  game: {
    roleName: "Desarrollador de Videojuegos",
    steps: [
      {
        title: "Paso 1: Lógica y un motor",
        duration: "Mes 1",
        description:
          "Elige un motor amigable y aprende su lenguaje. Empieza por lo pequeño: mover un cuadrado en pantalla ya es un logro.",
        skillsToLearn: ["C# (Unity) o GDScript (Godot)", "Lógica de programación", "Git y GitHub"],
        kuniTip: "No arranques con tu 'MMORPG soñado'. Tu primer juego debe caber en una tarde. En serio, crack."
      },
      {
        title: "Paso 2: Mecánicas de un juego 2D",
        duration: "Meses 2 al 3",
        description:
          "Construye un juego 2D completo y sencillo: físicas, colisiones y un par de niveles. Termínalo de principio a fin.",
        skillsToLearn: ["Motor (Unity o Godot)", "Físicas y colisiones", "Diseño de niveles simple"],
        kuniTip: "Terminar un juego feíto pero completo enseña más que empezar diez juegos bonitos que nunca acabas."
      },
      {
        title: "Paso 3: Un juego jugable publicado",
        duration: "Mes 4",
        description:
          "Añade sonido, pule detalles, exporta tu build y publícalo gratis. Que la gente lo juegue de verdad.",
        skillsToLearn: ["Pulido y sonido", "Exportar / build", "Publicar en itch.io"],
        kuniTip: "Sube tu juego a itch.io y compártelo. El feedback real de jugadores no tiene precio para crecer."
      }
    ]
  }
};

// Exported for unit testing — the deterministic, no-AI roadmap generator is the
// one piece of real business logic on the front end. Pure function, no DOM.
export function buildRoadmap(stage: string, role: string, doubt: string): RoadmapResponse {
  const base = ROLE_ROADMAPS[role] ?? ROLE_ROADMAPS.frontend;
  const stageLabel = STAGE_LABEL[stage] ?? "estás empezando en tecnología";
  const finalAdvice = STAGE_FINAL_ADVICE[stage] ?? STAGE_FINAL_ADVICE.universidad_inicial;

  const doubtLine = doubt.trim()
    ? `Sobre tu duda ("${doubt.trim()}"): tranquilo, es de las más comunes que escucho y tiene solución.`
    : "Tu principal reto ahora es simplemente empezar de forma ordenada, y para eso está esta ruta.";

  const summary = `¡Hola crack! Analicé tu caso: ${stageLabel} y apuntas a ${base.roleName}. ${doubtLine} Aquí te armé una ruta práctica de 3 pasos, sin teoría de relleno y enfocada en proyectos reales. ¡Vamos con todo!`;

  return {
    roleName: base.roleName,
    summary,
    steps: base.steps,
    kuniFinalAdvice: finalAdvice
  };
}

export default function RoadmapBuilder({ stageOverride, onScrollTo }: RoadmapBuilderProps) {
  const [currentStage, setCurrentStage] = useState<string>("secundaria");
  const [dreamRole, setDreamRole] = useState<string>("frontend");
  const [mainDoubt, setMainDoubt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);

  // Sync stageOverride from WhoIsItFor section clicks
  React.useEffect(() => {
    if (stageOverride) {
      setCurrentStage(stageOverride);
      const el = document.getElementById("probar-ia");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [stageOverride]);

  const stages = [
    { key: "secundaria", title: "🎒 Colegio", subtitle: "4to y 5to SEC" },
    { key: "universidad_inicial", title: "🎓 Universidad/Inst.", subtitle: "Ciclo inicial (1-2)" },
    { key: "reconversion", title: "💼 Reconversión", subtitle: "Quiero cambiar de rubro" }
  ];

  const roles = [
    { key: "frontend", title: "🌐 Front-End", desc: "Interfaces dinámicas (React, Tailwind)" },
    { key: "backend", title: "⚙️ Back-End", desc: "Base de datos y Servidores (Node, Python)" },
    { key: "datascience", title: "📊 Data Dev / Python", desc: "Manejo de Base de Datos y Gráficos" },
    { key: "ia_engineer", title: "🤖 IA Engineer", desc: "Modelos, Prompts y Agentes Inteligentes" },
    { key: "mobile", title: "📱 App Móvil", desc: "Apps en celular (React Native o Flutter)" },
    { key: "game", title: "🎮 Videojuegos", desc: "Desarrollo con Unity o Godot" }
  ];

  const handleCreateRoadmap = () => {
    setLoading(true);
    setRoadmap(null);
    // Pequeña pausa para que la animación de armado se sienta intencional.
    setTimeout(() => {
      setRoadmap(buildRoadmap(currentStage, dreamRole, mainDoubt));
      setLoading(false);
    }, 650);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="probar-ia" className="bg-[#fcf9f8] py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-black relative">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header content section */}
        <div className="text-center space-y-4">
          <span className="bg-yellow-100 text-yellow-800 border-2 border-yellow-400 font-mono text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Compass className="w-4 h-4 animate-bounce-slow" />
            Generador de ruta de Kuni · Gratis
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans text-gray-900 tracking-tight leading-none pt-2">
            Ruta de Carrera Interactiva
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 font-sans">
            Responde 3 preguntas rápidas y te armo al instante una hoja de ruta clara y práctica, basada en la experiencia real de Kuni asesorando a cientos de personas.
          </p>
        </div>

        {/* Builder Container */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative overflow-hidden">

          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-6">

            {/* Step 1: Stage */}
            <div className="space-y-3 text-left">
              <label className="text-sm font-black font-sans uppercase text-gray-800 tracking-wide flex items-center gap-2">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full inline-flex items-center justify-center font-mono text-xs">1</span>
                ¿En qué etapa te encuentras?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stages.map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setCurrentStage(st.key)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all text-xs font-sans font-semibold cursor-pointer ${
                      currentStage === st.key
                        ? "bg-[#eef3fc] text-[#0054d4] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-x-0.5"
                        : "bg-white border-gray-200 text-gray-700 hover:border-black"
                    }`}
                    id={`roadmap-stage-btn-${st.key}`}
                  >
                    <div className="font-bold">{st.title}</div>
                    <div className="text-[10px] text-gray-600 font-normal">{st.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Role */}
            <div className="space-y-3 text-left">
              <label className="text-sm font-black font-sans uppercase text-gray-800 tracking-wide flex items-center gap-2">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full inline-flex items-center justify-center font-mono text-xs">2</span>
                ¿Qué rol sueñas alcanzar?
              </label>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-2">
                {roles.map((rl) => (
                  <button
                    key={rl.key}
                    onClick={() => setDreamRole(rl.key)}
                    className={`w-full p-2.5 rounded-xl border-2 text-left text-xs font-sans font-semibold cursor-pointer flex items-center justify-between transition-all ${
                      dreamRole === rl.key
                        ? "bg-[#fcf3f8] text-pink-600 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-x-0.5"
                        : "bg-white border-gray-200 text-gray-700 hover:border-black"
                    }`}
                    id={`roadmap-role-btn-${rl.key}`}
                  >
                    <div>
                      <div className="font-bold">{rl.title}</div>
                      <div className="text-[10px] text-gray-600 font-normal">{rl.desc}</div>
                    </div>
                    {dreamRole === rl.key && <CheckCircle className="w-4 h-4 text-pink-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Doubt Text */}
            <div className="space-y-3 text-left">
              <label className="text-sm font-black font-sans uppercase text-gray-800 tracking-wide flex items-center gap-2">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full inline-flex items-center justify-center font-mono text-xs">3</span>
                ¿Cuál es tu principal duda o bloqueo?
              </label>
              <textarea
                value={mainDoubt}
                onChange={(e) => setMainDoubt(e.target.value)}
                placeholder="Ej: Tengo miedo de que la carrera use demasiada matemática avanzada o no sé por qué framework empezar."
                className="w-full p-3 border-2 border-black rounded-2xl text-xs font-sans text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0054d4] transition-all bg-[#fcf9f8]"
                rows={3}
                id="roadmap-doubt-textarea"
              />
            </div>

            {/* CTA Generate */}
            <button
              onClick={handleCreateRoadmap}
              disabled={loading}
              className="w-full py-4 bg-[#0054d4] text-white font-sans font-black text-lg rounded-2xl border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
              id="roadmap-generate-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Armando tu ruta...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generar Ruta de Aprendizaje gratis
                </>
              )}
            </button>
          </div>

          {/* Output Results Panel */}
          <div className="lg:col-span-7 h-full flex flex-col justify-center">

            {loading ? (
              <div className="w-full py-24 text-center flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#0054d4] animate-spin" />
                  <Sparkles className="w-6 h-6 text-pink-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans font-black text-lg text-gray-900 animate-pulse">
                    Armando tu plan personalizado...
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    Estructurando los pasos según tu etapa y el rol que elegiste.
                  </p>
                </div>
              </div>
            ) : roadmap ? (
              <div className="w-full space-y-6 text-left animate-fade-in" id="print-roadmap-area">

                {/* Result header */}
                <div className="bg-blue-50 border-2 border-black p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-[#0054d4] text-white font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Ruta Proporcionada
                    </span>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0054d4] hover:underline cursor-pointer"
                      id="roadmap-print-btn"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Imprimir mapa
                    </button>
                  </div>
                  <h3 className="text-xl font-black font-sans text-gray-900">
                    🚀 {roadmap.roleName}
                  </h3>
                  <p className="text-xs text-gray-700 italic leading-relaxed font-sans">
                    "{roadmap.summary}"
                  </p>
                </div>

                {/* Vertical Step Tree Visual */}
                <div className="relative pl-6 space-y-6 border-l-2 border-dashed border-gray-300">
                  {roadmap.steps.map((st, idx) => (
                    <div key={idx} className="relative space-y-2">

                      {/* Left circular bullet indicator */}
                      <div className="absolute left-[-35px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center font-mono text-xs font-black text-gray-900">
                        {idx + 1}
                      </div>

                      {/* Step Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h4 className="text-base font-black font-sans text-gray-900">
                          {st.title}
                        </h4>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-pink-600 bg-pink-100/50 px-2.5 py-0.5 rounded-full border border-pink-200">
                          <Clock className="w-3 h-3" />
                          {st.duration}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 leading-normal font-sans">
                        {st.description}
                      </p>

                      {/* Skills learned chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {st.skillsToLearn.map((chip, chipIdx) => (
                          <span
                            key={chipIdx}
                            className="bg-gray-100 border border-gray-300 text-gray-800 text-[10px] font-mono px-1.5 py-0.5 rounded-md uppercase"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>

                      {/* Kuni Advisor Tip balloon */}
                      <div className="bg-yellow-50 border border-yellow-300 p-3 rounded-xl text-xs text-amber-900 leading-snug font-sans mt-2 relative">
                        <div className="font-black text-[10px] uppercase text-amber-700 tracking-wider">
                          💡 Kuni Tip:
                        </div>
                        {st.kuniTip}
                      </div>

                    </div>
                  ))}
                </div>

                {/* Final Advices */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2 border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-pink-400 font-bold">
                    🚀 Consejo final para salir a la cancha
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {roadmap.kuniFinalAdvice}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => onScrollTo("precios")}
                      className="text-xs font-bold font-sans text-yellow-300 hover:underline cursor-pointer"
                      id="roadmap-result-book"
                    >
                      Planificar esto con Kuni en vivo por S/30 →
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 px-4 space-y-4">
                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl inline-flex">
                  <BookOpen className="w-12 h-12 text-gray-300" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans font-black text-base text-gray-900">
                    Tu plan interactivo aparecerá aquí
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto font-sans">
                    Selecciona en el lado izquierdo tu etapa y el rol que sueñas, y haz clic en "Generar Ruta" para armar tu hoja de ruta.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
