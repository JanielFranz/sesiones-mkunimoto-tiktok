import React, { useState, useEffect } from "react";
import { Star, MessageSquarePlus, RefreshCw, Send, CheckCircle, GraduationCap } from "lucide-react";
import { Testimonial } from "../types";

export default function TestimonialsGuestbook() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [isStudent, setIsStudent] = useState<boolean>(true);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/testimonials");
      if (!response.ok) {
        throw new Error("No se pudo cargar los comentarios del servidor.");
      }
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !text) {
      setErr("Por favor completa todos los campos del testimonio.");
      return;
    }

    setSubmitting(true);
    setErr(null);
    try {
      const response = await fetch("/api/testimonials/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, text, rating, isStudent })
      });

      if (!response.ok) {
        throw new Error("Falló al subir tu testimonio.");
      }

      // Reload
      await fetchTestimonials();
      
      setSubmitted(true);
      setName("");
      setRole("");
      setText("");
      setRating(5);
      
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error: any) {
      console.error(error);
      setErr(error?.message || "Algo falló cargando el comentario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonios-g" className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-mono text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-[1px_1px_rgba(0,0,0,1)]">
            💬 opiniones de la comunidad
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900 leading-none">
            Testimonios y Libro de Visitas
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 font-sans">
            Comentarios reales del alumnado e interesados que ya pasaron por las asesorías con Kuni. ¡Deja tu propia firma!
          </p>
        </div>

        {/* Guestbook layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Testimonial Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-sans font-black text-lg text-gray-900">
                Opiniones Recientes ({testimonials.length})
              </h3>
              <button
                onClick={fetchTestimonials}
                className="p-1 px-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:border-black cursor-pointer flex items-center gap-1"
                id="guestbook-refresh-btn"
              >
                <RefreshCw className="w-3 h-3" />
                Actualizar
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-gray-500">
                Cargando testimonios reales...
              </div>
            ) : testimonials.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-gray-200 rounded-3xl text-center text-sm text-gray-500">
                Aún no hay testimonios en el Guestbook. ¡Sé el primero en firmar!
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="relative bg-[#fcf9f8] border-2 border-black rounded-3xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left space-y-3 hover:translate-x-0.5 transition-all"
                  >
                    {/* Upper profile header info */}
                    <div className="flex gap-3 justify-between items-start">
                      <div className="flex gap-2.5 items-center">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-black object-cover bg-amber-50"
                        />
                        <div>
                          <h4 className="font-sans font-black text-xs text-gray-900 leading-tight">
                            {t.name}
                          </h4>
                          <span className="text-[10px] font-mono font-medium text-gray-500 flex items-center gap-0.5 mt-0.5">
                            {t.isStudent && <GraduationCap className="w-3.5 h-3.5 text-blue-500" />}
                            {t.role}
                          </span>
                        </div>
                      </div>

                      {/* Stars rating */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed font-sans italic">
                      "{t.text}"
                    </p>

                    <div className="flex justify-end font-mono text-[9px] text-gray-400">
                      <span>{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Submission Form */}
          <div className="lg:col-span-5 bg-[#fcfcf9] border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
            <div className="space-y-1">
              <h3 className="font-sans font-black text-lg text-gray-900 flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-[#0054d4]" />
                Deja tu opinión
              </h3>
              <p className="text-xs text-gray-500 font-sans">
                ¿Asististe a una videollamada o probaste el consultor virtual? Ayúdanos contando tu experiencia.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 font-sans">Tu Nombre *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Sofía Rojas"
                    className="w-full p-2.5 border border-black rounded-xl text-xs bg-white focus:ring-1 focus:ring-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 font-sans font-mono animate-pulse">¿Qué rol tienes? *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ej: Estudiante 3er Ciclo"
                    className="w-full p-2.5 border border-black rounded-xl text-xs bg-white focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Rating selection */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase text-gray-500 font-sans">Calificación: {rating} Estrellas</label>
                  <div className="flex gap-1.5 items-center font-mono">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        className="hover:scale-110 cursor-pointer transition-transform"
                      >
                        <Star 
                          className={`w-5 h-5 ${starVal <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Student toggle badge */}
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-black uppercase text-gray-500 font-sans block">¿Estudiante de Sistemas?</span>
                  <button
                    type="button"
                    onClick={() => setIsStudent(!isStudent)}
                    className={`px-3 py-1.5 border rounded-full text-xs font-bold leading-none cursor-pointer transition-all ${
                      isStudent 
                        ? "bg-blue-100 border-[#0054d4] text-[#0054d4]" 
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    }`}
                  >
                    {isStudent ? "🧑‍🎓 Sí, soy estudiante" : "💼 No, autodidacta/otros"}
                  </button>
                </div>
              </div>

              {/* Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 font-sans">Comentario / Testimonio *</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe lo más honesto posible qué tal te pareció el material que Kuni expone..."
                  className="w-full p-3 border border-black rounded-xl text-xs bg-white focus:ring-1 focus:ring-black"
                  rows={3}
                />
              </div>

              {err && (
                <div className="bg-red-50 text-red-600 border border-red-300 rounded-xl p-2.5 text-xs text-center font-sans">
                  {err}
                </div>
              )}

              {/* Submit Btn */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#0054d4] text-white font-sans font-black text-sm rounded-xl border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[3px_3px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center gap-2"
                id="guestbook-submit-btn"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publicar mi opinión
                  </>
                )}
              </button>

              {/* Success indicator bubble */}
              {submitted && (
                <div className="bg-emerald-50 text-emerald-600 border border-emerald-300 rounded-xl p-2.5 text-xs text-center font-sans flex items-center justify-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Testimonio publicado en el feed.
                </div>
              )}

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
