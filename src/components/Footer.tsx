import React from "react";
import { MessageSquare, Heart, Terminal, Circle } from "lucide-react";

interface FooterProps {
  onScrollTo: (sectionId: string) => void;
}

export default function Footer({ onScrollTo }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-350 py-12 px-4 sm:px-6 lg:px-8 border-t-2 border-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left Side Label */}
        <div className="flex items-center gap-2 text-left">
          <div className="bg-[#0054d4] text-white p-1 rounded-md font-extrabold text-sm border border-white">
            K
          </div>
          <span className="text-xl font-black tracking-tight text-white font-sans">
            Kuni<span className="text-[#0054d4]">.</span>
          </span>
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase border border-slate-800 px-2 py-0.5 rounded-full">
            Dev Mentorship
          </span>
        </div>

        {/* Center Navigation Shortcuts */}
        <div className="flex flex-wrap justify-center gap-5 text-xs text-slate-400 font-mono font-semibold">
          <button onClick={() => onScrollTo("sobre-mi")} className="hover:text-white cursor-pointer">Sobre Kuni</button>
          <button onClick={() => onScrollTo("como-funciona")} className="hover:text-white cursor-pointer">Cómo Funciona</button>
          <button onClick={() => onScrollTo("probar-ia")} className="hover:text-white cursor-pointer">Ruta IA</button>
          <button onClick={() => onScrollTo("faq")} className="hover:text-white cursor-pointer">FAQ</button>
        </div>

        {/* Right Side Tribute */}
        <div className="text-xs font-mono text-slate-500 text-center md:text-right flex items-center gap-1.5 justify-center">
          <span>Creado con</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>por</span>
          <span className="text-slate-300 font-black">Kuni Devs PERÚ</span>
          <span>© 2026</span>
        </div>

      </div>
    </footer>
  );
}
