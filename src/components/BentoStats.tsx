import React, { useState } from "react";
import { Users, Video, DollarSign, ArrowUpRight, BarChart3, Star, X } from "lucide-react";

export default function BentoStats() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const stats = [
    {
      id: "tiktok",
      number: "120K+",
      label: "COMUNIDAD TIKTOK",
      sub: "@kunidevs",
      color: "bg-[#eef3fc] hover:bg-sky-50",
      icon: <Video className="w-5 h-5 text-sky-600" />,
      detailTitle: "🎥 Temas favoritos en TikTok",
      detailContent: (
        <div className="space-y-2 mt-2 text-xs">
          <p className="text-gray-600">Comunidad de aprendizaje rápido activa en Perú, LATAM y España:</p>
          <ul className="list-disc pl-4 space-y-1 text-gray-700 font-mono">
            <li>¿Cuánto gana realmente un Junior en Perú? (500K views)</li>
            <li>Ruta realista de autodidacta 2026 (350K views)</li>
            <li>No estudies de memoria: El hack de los bloques (200K views)</li>
          </ul>
        </div>
      )
    },
    {
      id: "students",
      number: "+500",
      label: "ESTUDIANTES ASESORADOS",
      sub: "Ingresaron a Ingeniería y Tech",
      color: "bg-[#fcf3f8] hover:bg-pink-50",
      icon: <Users className="w-5 h-5 text-pink-600" />,
      detailTitle: "📊 De dónde vienen los alumnos",
      detailContent: (
        <div className="space-y-2 mt-2 text-xs">
          <p className="text-gray-600">Estadísticas reales acumuladas de mentorías:</p>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-gray-700">
              <span>Colegios (4to/5to Sec):</span>
              <span className="font-bold">40%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full w-[40%]" />
            </div>
            
            <div className="flex justify-between font-mono text-gray-700 mt-1">
              <span>Ciclos Iniciales (U/Inst):</span>
              <span className="font-bold">35%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full w-[35%]" />
            </div>

            <div className="flex justify-between font-mono text-gray-700 mt-1">
              <span>Reconversión Laboral:</span>
              <span className="font-bold">25%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full w-[25%]" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "price",
      number: "S/30",
      label: "INVERSIÓN ACCESIBLE",
      sub: "Por única sesión intensiva",
      color: "bg-[#fcfaf3] hover:bg-amber-50",
      icon: <DollarSign className="w-5 h-5 text-amber-600" />,
      detailTitle: "⚖️ Comparativa contra Bootcamps",
      detailContent: (
        <div className="space-y-2 mt-2 text-xs">
          <p className="text-gray-600">¿Por qué de bajo costo? Mi misión es democratizar la mentoría tech peruana:</p>
          <div className="bg-amber-100/60 p-2 rounded-xl text-[11px] font-mono border border-amber-300">
            <div className="flex justify-between text-gray-700">
              <span>Típico Bootcamp:</span>
              <span className="line-through">S/ 4,000+</span>
            </div>
            <div className="flex justify-between text-[#0054d4] font-bold">
              <span>Tu Sesión con Kuni:</span>
              <span>S/ 30</span>
            </div>
          </div>
          <p className="text-gray-500 italic">Orientación y consejos honestos sin contratos abusivos de ISA.</p>
        </div>
      )
    }
  ];

  return (
    <section className="bg-white border-t-2 border-b-2 border-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="sr-only">Estadísticas Clave</h2>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(activeTab === item.id ? null : item.id)}
              className={`relative border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer ${item.color} flex flex-col justify-between`}
              id={`stat-card-${item.id}`}
            >
              {/* Card Header Info */}
              <div className="flex items-center justify-between w-full">
                <div className="bg-white p-2 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  {item.icon}
                </div>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-500">
                  <span>Ver insights</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Number Stat */}
              <div className="mt-6 text-left">
                <p className="text-5xl font-black font-sans tracking-tight text-gray-900">
                  {item.number}
                </p>
                <p className="mt-1 font-sans text-xs font-black uppercase text-[#0054d4] tracking-widest">
                  {item.label}
                </p>
                <p className="text-xs font-sans text-gray-600 mt-1">
                  {item.sub}
                </p>
              </div>

              {/* Interactive panel expander */}
              {activeTab === item.id && (
                <div 
                  className="mt-4 pt-4 border-t border-dashed border-gray-400 text-left animate-fade-in"
                  onClick={(e) => e.stopPropagation()} // Prevent closing
                >
                  <div className="flex justify-between items-center bg-[#fcf9f8] px-2 py-1 rounded-lg border border-black/15 text-xs font-bold text-gray-800">
                    <span>{item.detailTitle}</span>
                    <button 
                      onClick={() => setActiveTab(null)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {item.detailContent}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Informative helper info underneath */}
        <p className="text-center font-sans font-medium text-xs text-slate-500 mt-6 tracking-wide">
          ☝️ Haz clic en los bento cards superiores para expandir las estadísticas reales de la comunidad de Kuni.
        </p>
      </div>
    </section>
  );
}
