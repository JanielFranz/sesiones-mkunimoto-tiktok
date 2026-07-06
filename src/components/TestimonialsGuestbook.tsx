import React from "react";
import { Star, GraduationCap, Quote, Users } from "lucide-react";
import { Testimonial } from "../types";

// Testimonios estáticos (curados por Kuni). No dependen del servidor ni de una BD:
// se renderizan directamente en el HTML. Para editar, cambia este arreglo.
const TESTIMONIALS: Testimonial[] = [
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
    text: "La mejor S/ 30 invertidos de mi vida. Me dio un panorama súper realista y amigable de qué hace un Programador en el día a día. Decidido al 100% que estudiaré Ing de Software en la UNI.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    date: "Hace 1 semana",
    isStudent: true
  }
];

export default function TestimonialsGuestbook() {
  const avgRating =
    TESTIMONIALS.length > 0
      ? (TESTIMONIALS.reduce((acc, t) => acc + t.rating, 0) / TESTIMONIALS.length).toFixed(1)
      : "5.0";

  return (
    <section id="testimonios-g" className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-black">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-mono text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-[1px_1px_rgba(0,0,0,1)]">
            💬 opiniones de la comunidad
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900 leading-none">
            Lo que dicen los asesorados
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 font-sans">
            Historias reales de escolares, universitarios de primeros ciclos y personas en reconversión que ya pasaron por una sesión con Kuni.
          </p>

          {/* Rating summary strip */}
          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border-2 border-black rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="font-sans font-black text-sm text-gray-900">{avgRating}</span>
              <span className="font-mono text-[11px] text-gray-500">promedio</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border-2 border-black rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Users className="w-4 h-4 text-[#0054d4]" />
              <span className="font-sans font-black text-sm text-gray-900">+500</span>
              <span className="font-mono text-[11px] text-gray-500">asesorados</span>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="relative bg-[#fcf9f8] border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all text-left flex flex-col justify-between gap-4"
            >
              {/* Decorative quote mark */}
              <Quote className="absolute top-5 right-5 w-8 h-8 text-gray-200" />

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-4 h-4 ${
                      idx < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-sm text-gray-700 leading-relaxed font-sans italic relative z-10">
                "{t.text}"
              </p>

              {/* Profile footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-dashed border-gray-300 mt-auto">
                <img
                  src={t.avatar}
                  alt={t.name}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full border-2 border-black object-cover bg-amber-50"
                />
                <div className="min-w-0">
                  <h4 className="font-sans font-black text-sm text-gray-900 leading-tight truncate">
                    {t.name}
                  </h4>
                  <span className="text-[11px] font-mono font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                    {t.isStudent && <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                    <span className="truncate">{t.role}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
