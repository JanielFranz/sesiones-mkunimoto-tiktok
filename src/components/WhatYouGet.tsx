import React, { useState } from "react";
import { CheckCircle2, Monitor, Code, Terminal, Compass, Disc, Sparkles } from "lucide-react";

export default function WhatYouGet() {
  const [activeHotspot, setActiveHotspot] = useState<string>("editor");

  const hotspots = [
    {
      id: "editor",
      title: "📝 Código Ordenado (VS Code)",
      description: "Estrategias sobre cómo modular tu código React, estructurar tus carpetas, usar TypeScript de forma segura y evitar malas prácticas comunes."
    },
    {
      id: "browser",
      title: "🌐 Aplicaciones en Vivo",
      description: "Despliegues reales en la nube (Vercel, Netlify o Render) para que tus familiares y reclutadores interactúen con tus creaciones."
    },
    {
      id: "github",
      title: "🐙 Historial Verde (GitHub)",
      description: "Cómo construir un perfil atractivo con Readmes interactivos, contribuciones consistentes e historias de proyectos reales que destaquen."
    },
    {
      id: "terminal",
      title: "💻 Terminal & Scripts",
      description: "Familiarízate con comandos básicos de UNIX, automatización sencilla y herramientas de construcción (Vite, npm scripts) como un pro de verdad."
    }
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-left space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900">
            ¿Qué obtienes en una sesión?
          </h2>
          <p className="max-w-3xl text-sm sm:text-base text-gray-600 font-sans">
            No es solo una llamada cualquiera; es el inicio de tu transformación profesional en el desarrollo. Nos enfocamos en resolver tus bloqueos técnicos específicos y darte herramientas de inmediato.
          </p>
        </div>

        {/* Binary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Block - Key Details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Benefit Box 1 */}
            <div className="bg-[#fcf3f8] border-2 border-black rounded-3xl p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-pink-600 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-sans text-gray-900">
                    Hoja de ruta personalizada
                  </h3>
                  <p className="text-xs text-gray-600 font-sans mt-1">
                    Un plan pragmático paso a paso basado en tus metas reales, tiempos disponibles y conocimientos previos.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefit Box 2 */}
            <div className="bg-[#eef3fc] border-2 border-black rounded-3xl p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-[#0054d4] fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-sans text-gray-900">
                    Revisión de LinkedIn & CV
                  </h3>
                  <p className="text-xs text-gray-600 font-sans mt-1">
                    Hacemos que tu perfil llame la atención de los reclutadores de software usando palabras claves reales de sistemas.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefit Box 3 */}
            <div className="bg-[#fcfaf3] border-2 border-black rounded-3xl p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-sans text-gray-900">
                    Soporte e Introducción Comunitaria
                  </h3>
                  <p className="text-xs text-gray-600 font-sans mt-1">
                    Te conectamos con nuestra red activa de estudiantes y desarrolladores juniors en Discord para que compartas código.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Block - Interactive Workstation Preview */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border-2 border-black rounded-3xl p-5 sm:p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-[#dee2e6] relative overflow-hidden">
              
              {/* Window top buttons */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="font-mono text-[10px] tracking-widest text-[#0054d4] uppercase font-black bg-white px-2.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  ⌨️ KUNI_WORKSPACE
                </div>
              </div>

              {/* Station display mockup */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4">
                
                {/* Desktop Left Mock - Screens Hotspots selection */}
                <div className="md:col-span-5 flex flex-col gap-2 font-sans">
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wide px-1.5">
                    ⚙️ Explora herramientas de sesión
                  </p>
                  {hotspots.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setActiveHotspot(h.id)}
                      className={`w-full text-left p-2.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer flex justify-between items-center ${
                        activeHotspot === h.id
                          ? "bg-[#0054d4] text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-x-0.5"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700"
                      }`}
                      id={`hotspot-btn-${h.id}`}
                    >
                      <span>{h.title}</span>
                      <Sparkles className={`w-3.5 h-3.5 ${activeHotspot === h.id ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </div>

                {/* Desktop Right Mock - Visual screen display */}
                <div className="md:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between min-h-[180px]">
                  <div>
                    {activeHotspot === "editor" && (
                      <div className="font-mono text-[11px] space-y-1.5 text-left">
                        <div className="text-slate-500">// src/App.tsx - Kuni's modular way</div>
                        <div className="text-emerald-400">import <span className="text-sky-400">React</span> from <span className="text-amber-300">"react"</span>;</div>
                        <div className="text-purple-400">export default function <span className="text-yellow-300">App</span>() &#123;</div>
                        <div className="text-emerald-400">&nbsp;&nbsp;return (</div>
                        <div className="text-sky-400">&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-red-400">DynamicRoadmap</span> /&gt;</div>
                        <div className="text-emerald-400">&nbsp;&nbsp;);</div>
                        <div className="text-purple-400">&#125;</div>
                      </div>
                    )}

                    {activeHotspot === "browser" && (
                      <div className="font-mono text-[11px] space-y-2 text-left">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-[10px] text-slate-300">https://mi-portafolio.vercel.app</span>
                        </div>
                        <div className="p-2 border border-dashed border-slate-800 rounded-lg text-slate-400 text-center">
                          🚀 Desplegado en vivo en 1 segundo con Vercel.
                        </div>
                      </div>
                    )}

                    {activeHotspot === "github" && (
                      <div className="space-y-2 text-left font-sans">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-emerald-500 rounded" />
                          <span className="font-mono font-bold text-xs">@kunidevs Contributions</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1 bg-slate-900 p-2 rounded-lg">
                          {Array.from({ length: 48 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-2.5 rounded-sm ${
                                i % 3 === 0 ? 'bg-emerald-800' : i % 5 === 0 ? 'bg-emerald-500' : i % 7 === 0 ? 'bg-emerald-400' : 'bg-slate-800'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {activeHotspot === "terminal" && (
                      <div className="font-mono text-left text-xs space-y-1 text-slate-300">
                        <div>$ npm run build</div>
                        <div className="text-yellow-400">vite v6.2.3 building...</div>
                        <div className="text-emerald-400">✓ 42 modules transformed.</div>
                        <div className="text-indigo-400">✓ dist/assets/index.js (3.2kB)</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-left text-[11px]">
                    <span className="text-[#0054d4] font-bold">Respuesta:</span>{" "}
                    <span className="text-slate-400 font-sans">
                      {hotspots.find((h) => h.id === activeHotspot)?.description}
                    </span>
                  </div>

                </div>

              </div>
              
              {/* Extra decoration line */}
              <div className="pt-2 text-[10px] text-center italic text-slate-500 font-mono mt-2 flex justify-center items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-pink-500 animate-spin" />
                Haz clic en los botones laterales para inspeccionar tu propio workstation.
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
