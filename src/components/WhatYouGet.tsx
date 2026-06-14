import React, { useState } from "react";
import { CheckCircle2, Disc, Sparkles } from "lucide-react";

export default function WhatYouGet() {
  const [activeHotspot, setActiveHotspot] = useState<string>("comparar");

  const hotspots = [
    {
      id: "comparar",
      title: "🧭 Comparación de Carreras",
      description: "Analizamos qué hace un profesional de Software, Sistemas, Ciencias de la Computación o IA, y comparamos su enfoque práctico y laboral."
    },
    {
      id: "diagnostico",
      title: "🎯 Diagnóstico Vocacional",
      description: "Identificamos tus bloqueos (miedo al código, indecisión académica) para diseñar material personalizado preparado exclusivamente para ti."
    },
    {
      id: "meet",
      title: "📅 Meet de 1 Hora (1:1)",
      description: "Una videollamada interactiva de 60 minutos enfocada totalmente en ti y tus dudas, por solo S/ 30 la sesión."
    },
    {
      id: "practicas",
      title: "🚀 Ruta de Inserción",
      description: "Para estudiantes avanzados: estructuramos tu portafolio y LinkedIn para destacar ante reclutadores y conseguir tus primeras prácticas."
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
            No es solo una videollamada cualquiera; es un espacio personalizado de 1 hora por Google Meet a solo S/ 30 para tomar decisiones informadas sobre tu futuro en tecnología.
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
                    Claridad y Elección de Carrera
                  </h3>
                  <p className="text-xs text-gray-600 font-sans mt-1">
                    Te ayudo a entender las diferencias reales y a elegir entre Ingeniería de Software, Sistemas, Ciencias de la Computación o IA, según lo que de verdad te apasione y convenga.
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
                    Hoja de Ruta de Aprendizaje
                  </h3>
                  <p className="text-xs text-gray-600 font-sans mt-1">
                    Diseñamos un plan de estudio y de proyectos prácticos adaptado a tu nivel (colegio, universidad o reconversión) para que dejes la teoría pesada.
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
                    Realidad Laboral e Inserción
                  </h3>
                  <p className="text-xs text-gray-600 font-sans mt-1">
                    Conoce qué te espera en el día a día laboral, cómo prepararte para conseguir tus primeras prácticas pre-profesionales y cómo afrontar entrevistas técnicas sin paltear.
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
                    {activeHotspot === "comparar" && (
                      <div className="font-mono text-[11px] space-y-1.5 text-left text-emerald-400">
                        <div className="text-slate-500">// Comparación de Carreras Tech</div>
                        <div>Software: <span className="text-slate-300">Crea productos web/móviles y código útil.</span></div>
                        <div>Sistemas: <span className="text-slate-300">Gestiona redes, arquitectura y procesos TI.</span></div>
                        <div>Computación: <span className="text-slate-300">Lógica profunda, algoritmos y teoría.</span></div>
                        <div>IA: <span className="text-slate-300">Modelos matemáticos, Machine Learning y Python.</span></div>
                      </div>
                    )}

                    {activeHotspot === "diagnostico" && (
                      <div className="font-mono text-[11px] space-y-1.5 text-left text-sky-400">
                        <div className="text-slate-500">// Perfil detectado de sesión</div>
                        <div>Etapa: <span className="text-yellow-300">4to/5to Sec o Primeros Ciclos</span></div>
                        <div>Duda principal: <span className="text-yellow-300">¿Es el desarrollo realmente para mí?</span></div>
                        <div>Acción Kuni: <span className="text-yellow-300">Simulación interactiva de código de 15 min.</span></div>
                      </div>
                    )}

                    {activeHotspot === "meet" && (
                      <div className="font-mono text-[11px] space-y-1.5 text-left text-pink-400">
                        <div className="text-slate-500">// Detalles de la mentoría 1:1</div>
                        <div>Plataforma: <span className="text-white">Google Meet (Llamada privada)</span></div>
                        <div>Duración: <span className="text-white">60 minutos de foco total</span></div>
                        <div>Inversión: <span className="text-white">S/ 30.00 PEN por sesión</span></div>
                        <div>Material: <span className="text-white">Incluido y personalizado</span></div>
                      </div>
                    )}

                    {activeHotspot === "practicas" && (
                      <div className="font-mono text-[11px] space-y-1.5 text-left text-indigo-400">
                        <div className="text-slate-500">// Pipeline de Inserción Laboral</div>
                        <div>1. Construir portafolio real en GitHub.</div>
                        <div>2. Optimizar LinkedIn con palabras clave ATS.</div>
                        <div>3. Simular entrevistas técnicas de nivel Junior.</div>
                        <div>4. Aprender a negociar tus primeras prácticas.</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-left text-[11px]">
                    <span className="text-[#0054d4] font-bold">Detalle:</span>{" "}
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
