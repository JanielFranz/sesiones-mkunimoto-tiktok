import React from "react";
import { GraduationCap, BookOpen, Shuffle, ArrowRight } from "lucide-react";

interface WhoIsItForProps {
  onSelectStage: (stage: string) => void;
}

export default function WhoIsItFor({ onSelectStage }: WhoIsItForProps) {
  
  const cards = [
    {
      id: "secundaria",
      icon: <GraduationCap className="w-8 h-8 text-[#0054d4]" />,
      title: "Estudiantes de 4to y 5to de secundaria",
      description: "Descubre si la tecnología es tu verdadera pasión antes de salir del colegio. Evita gastar años en una carrera que no disfrutes y conoce el panorama real de la industria.",
      cta: "Plan de colegio",
      stageKey: "secundaria",
      badge: "Pre-U / Colegios",
      color: "border-sky-500 hover:bg-sky-50/20"
    },
    {
      id: "universitario",
      icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
      title: "Estudiantes de 1er y 2do ciclo",
      description: "Supera los primeros retos de programación de la universidad o instituto. Aprende a crear proyectos reales de portafolio para sobresalir y construir una base sólida.",
      cta: "Plan universitario",
      stageKey: "universidad_inicial",
      badge: "Ciclos Iniciales",
      color: "border-[#0054d4] hover:bg-blue-50/20"
    },
    {
      id: "techie",
      icon: <Shuffle className="w-8 h-8 text-fuchsia-600" />,
      title: "Futuros Techies",
      description: "Tu plan de acción para saltar al mundo tecnológico desde cualquier otra área (reconversión laboral). Identifica qué habilidades blandas previas puedes apalancar hoy.",
      cta: "Plan de reconversión",
      stageKey: "reconversion",
      badge: "Reconversión Laboral",
      color: "border-fuchsia-500 hover:bg-fuchsia-50/20"
    }
  ];

  return (
    <section id="como-funciona" className="bg-[#fcf9f8] py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-black">
      <div className="max-w-7xl mx-auto text-center space-y-4">
        
        {/* Section Header */}
        <p className="font-mono text-xs font-bold text-[#0054d4] uppercase tracking-widest bg-blue-100 italic px-3 py-1 rounded-full inline-block">
          ENFOQUE TOTALMENTE PERSONALIZADO
        </p>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900 leading-tight">
          ¿Para quién es Kuni?
        </h2>
        
        <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 font-sans">
          Sin importar en qué etapa estés, hay un camino específico de aprendizaje para ti.
        </p>

        {/* Audience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectStage(card.stageKey)}
              className={`group relative bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-start text-left cursor-pointer`}
              id={`who-card-${card.id}`}
            >
              <div className="space-y-4 w-full">
                
                {/* Upper Badge and Icon */}
                <div className="flex justify-between items-center w-full">
                  <div className="p-3 bg-[#fcf9f8] rounded-2xl border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] bg-white">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#eae7e7] border border-black text-gray-700 px-2 py-0.5 rounded-full uppercase">
                    {card.badge}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-black font-sans text-gray-900 leading-snug group-hover:text-[#0054d4] transition-colors">
                  {card.title}
                </h3>
                
                <p className="text-sm font-sans text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* CTA Link inside Card */}
              <div className="mt-8 flex items-center justify-between w-full pt-4 border-t border-dashed border-gray-200">
                <span className="text-xs font-black font-mono text-[#0054d4] group-hover:underline uppercase tracking-wide">
                  👉 Probar {card.cta}
                </span>
                <div className="p-1.5 rounded-full border border-black bg-white group-hover:bg-[#0054d4] group-hover:text-white transition-colors shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs font-mono text-gray-500 mt-6 italic">
          💡 Presiona cualquiera de los perfiles anteriores para cargar su diagnóstico interactivo con IA de manera automática abajo.
        </p>

      </div>
    </section>
  );
}
