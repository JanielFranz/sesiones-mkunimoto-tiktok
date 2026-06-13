import React, { useState } from "react";
import { Sparkles, Terminal, MessageSquare, Heart, Code, Compass } from "lucide-react";

interface HeroProps {
  onScrollTo: (sectionId: string) => void;
  onOpenBooking: () => void;
}

export default function Hero({ onScrollTo, onOpenBooking }: HeroProps) {
  const [activeOrbital, setActiveOrbital] = useState<string | null>(null);

  const orbitals = [
    {
      id: "eng",
      label: "Software Engineering",
      icon: <Code className="w-4 h-4 text-emerald-600" />,
      position: "left-[-30px] top-[70%]",
      text: "💻 Estudiante de 8vo ciclo compartiendo trucos reales de la industria en vez de solo teoría universitaria aburrida.",
      color: "bg-emerald-50 border-emerald-400"
    },
    {
      id: "creator",
      label: "Content Creator",
      icon: <Terminal className="w-4 h-4 text-amber-600" />,
      position: "right-[-40px] top-[15%]",
      text: "🎥 Explicando programación de manera sencilla en TikTok, sin tecnicismos innecesarios para que todos entiendan de verdad.",
      color: "bg-amber-50 border-amber-400"
    }
  ];

  return (
    <section id="sobre-mi" className="relative bg-[#fcf9f8] pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative ambient elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-100 rounded-full blur-2xl opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column - Copy & Dialogue */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#0054d4] font-mono text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-[#0054d4]/40">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            +500 Asesorados con éxito
          </div>

          {/* Main Card (Neo-Brutalist dialogue box) */}
          <div className="w-full relative bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
            {/* Direct bubble indicator */}
            <div className="absolute left-10 top-[-10px] w-5 h-5 bg-white border-l-2 border-t-2 border-black transform rotate-45" />

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900 leading-tight">
              ¡Hola! Soy <span className="text-[#0054d4] underline decoration-wavy decoration-3 underline-offset-4">Kuni</span>
            </h1>
            
            <p className="mt-4 text-base sm:text-lg text-[#0054d4] font-semibold font-sans">
              Estudiante de Ingeniería de Software, creador de contenido y mentor apasionado por la tecnología.
            </p>

            <p className="mt-4 text-sm sm:text-base text-gray-700 leading-relaxed font-sans">
              Mi misión es democratizar el acceso a la orientación profesional en tecnología. He ayudado a cientos de personas a encontrar su camino en el desarrollo de software de forma práctica y directa.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button
              onClick={onOpenBooking}
              className="px-8 py-4 bg-[#0054d4] text-white font-sans font-black text-lg rounded-2xl border-2 border-black hover:-translate-y-1 active:translate-y-0 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center"
              id="hero-book-btn"
            >
              Reserva tu sesión S/30
            </button>
            
            <button
              onClick={() => onScrollTo("testimonios-g")}
              className="px-8 py-4 bg-white text-[#0054d4] font-sans font-black text-lg rounded-2xl border-2 border-black hover:-translate-y-1 active:translate-y-0 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center hover:bg-gray-50"
              id="hero-testimonials-btn"
            >
              Ver testimonios
            </button>
          </div>
        </div>

        {/* Right Column - Beautiful interactive photo design */}
        <div className="lg:col-span-5 flex justify-center py-6">
          <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px]">
            
            {/* Interactive orbit dashed border wrapper */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#0054d4]/30 animate-spin-infinite" style={{ animationDuration: '40s' }} />

            {/* Solid offset black support circle */}
            <div className="absolute inset-2 rounded-full bg-black border-2 border-black" />

            {/* Main Portrait Mask (lifted with white background) */}
            <div className="absolute inset-2 rounded-full overflow-hidden bg-[#e2f0ff] border-2 border-black transform transition-transform hover:scale-[1.02] duration-300">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=500" 
                alt="Kuni Portrait" 
                crossOrigin="anonymous" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale-10 hover:grayscale-0 transition-all"
              />
            </div>

            {/* Interactive Orbital Badge 1: Software Engineer */}
            {orbitals.map((orb) => (
              <div 
                key={orb.id}
                className={`absolute ${orb.position} z-10`}
                onMouseEnter={() => setActiveOrbital(orb.id)}
                onMouseLeave={() => setActiveOrbital(null)}
                onClick={() => setActiveOrbital(activeOrbital === orb.id ? null : orb.id)}
              >
                <button
                  className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 pointer-events-auto cursor-pointer font-sans font-extrabold text-xs text-gray-900 transition-all"
                  id={`orbital-badge-${orb.id}`}
                >
                  {orb.icon}
                  {orb.label}
                </button>

                {/* Micro info balloon popup */}
                {activeOrbital === orb.id && (
                  <div className={`absolute left-1/2 transform -translate-x-1/2 mt-3 w-64 p-3 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${orb.color} z-30 transition-all animate-bounce-soft`}>
                    <div className="absolute top-[-9px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-black rotate-45" />
                    <p className="text-xs text-gray-800 leading-snug font-sans">
                      {orb.text}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Interactive floating indicator */}
            <div className="absolute bottom-2 right-4 bg-yellow-300 border-2 border-black px-3 py-1 rounded-xl text-[10px] font-black font-sans uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce-slow">
              🔥 ¡Pasa el mouse!
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
