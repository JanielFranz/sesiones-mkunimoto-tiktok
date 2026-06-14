import React, { useState } from "react";
import { Sparkles, ArrowRight, RefreshCw, Terminal, CheckCircle, Download, BookOpen, Clock } from "lucide-react";
import { RoadmapResponse } from "../types";

interface RoadmapBuilderProps {
  stageOverride: string | null;
  onScrollTo: (sectionId: string) => void;
}

export default function RoadmapBuilder({ stageOverride, onScrollTo }: RoadmapBuilderProps) {
  const [currentStage, setCurrentStage] = useState<string>("secundaria");
  const [dreamRole, setDreamRole] = useState<string>("frontend");
  const [experienceYears, setExperienceYears] = useState<string>("0");
  const [mainDoubt, setMainDoubt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Sync stageOverride from WhoIsItFor section clicks
  React.useEffect(() => {
    if (stageOverride) {
      setCurrentStage(stageOverride);
      // Auto-scroll slightly into view
      const el = document.getElementById("probar-ia");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [stageOverride]);

  const stages = [
    { key: "secundaria", title: "🎒 Colegio", subtitle: "4to y 5to SEC" },
    { key: "universidad_inicial", title: "🎓 Universidad/Inst.", subtitle: "Ciclo inicial (1-2)" },
    { key: "universidad_final", title: "🏢 Universidad/Inst.", subtitle: "Ciclo final / No Junior" },
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

  const handleCreateRoadmap = async () => {
    setLoading(true);
    setErr(null);
    try {
      const response = await fetch("/api/gemini/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStage,
          dreamRole,
          experienceYears,
          mainDoubt: mainDoubt || "No tengo claro por dónde comenzar de forma rápida y práctica."
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el Cerebro IA de Kuni en el servidor.");
      }

      const resJson = await response.json();
      setRoadmap(resJson.data);
    } catch (error: any) {
      console.error(error);
      setErr(error?.message || "Algo salió mal comunicándose con el servidor Gemini.");
    } finally {
      setLoading(false);
    }
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
            <Sparkles className="w-4 h-4 animate-bounce-slow" />
            Cerebro virtual de Kuni (IA gratis)
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans text-gray-900 tracking-tight leading-none pt-2">
            Ruta de Carrera Interactiva
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 font-sans">
            Completa estas 4 preguntas rápidas para que mi Cerebro de IA analice tu situación actual y te diseñe una hoja de ruta técnica personalizada al instante.
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
                  Conectando con Kuni virtual...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generar Ruta de Aprendizaje gratis
                </>
              )}
            </button>

            {err && (
              <div className="bg-red-50 text-red-600 border border-red-300 rounded-xl p-3 text-xs font-sans text-left">
                {err}
              </div>
            )}
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
                    Armando tu plan personalizado en segundos...
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    Kuni AI está analizando las habilidades y estructurando los pasos lógicos.
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
                    Selecciona en el lado izquierdo tus opciones de carrera y haz clic en "Generar Ruta" para arrancar el Cerebro IA.
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
