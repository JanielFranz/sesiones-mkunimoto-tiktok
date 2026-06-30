import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowLeft, Video, Mail, CalendarCheck, CheckCircle } from "lucide-react";

// Tu event type real de Calendly (Sesión 1:1 — 60 min, con Google Meet).
const CALENDLY_URL = "https://calendly.com/math-kuni123/30min";
const CALENDLY_WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";

interface BookingCalendarProps {
  bookingFormRef?: React.RefObject<HTMLDivElement>;
}

// El campo `prep` se pre-rellena en la pregunta de preparación de Calendly,
// así Kuni ya sabe el contexto del estudiante antes de la llamada.
const motives = [
  {
    key: "secundaria",
    label: "🎒 Orientación Vocacional (Colegio)",
    sub: "Si estás en 4to/5to de secundaria y no sabes si estudiar una carrera tech.",
    prep: "Motivo: Orientación vocacional — Estudiante de 4to/5to de secundaria."
  },
  {
    key: "universitario",
    label: "🎓 Apoyo Universitario (Ciclos 1-2)",
    sub: "Dudas sobre si seguir o cómo pasar tus primeros cursos difíciles de progra.",
    prep: "Motivo: Apoyo universitario — Estudiante de 1er/2do ciclo con dudas de continuar o aprobar cursos."
  },
  {
    key: "reconversion",
    label: "💼 Reconversión / Orientación de Carrera",
    sub: "Dudas sobre Ing. de Software, Sistemas, Ciencias de la Computación o IA.",
    prep: "Motivo: Reconversión / orientación de carrera hacia el sector tech."
  },
  {
    key: "general",
    label: "⚡ Prácticas y Realidad Laboral",
    sub: "Consejos para armar tu portafolio, LinkedIn o buscar tus primeras prácticas.",
    prep: "Motivo: Prácticas y realidad laboral — portafolio, LinkedIn y primeras prácticas."
  }
] as const;

type MotiveKey = (typeof motives)[number]["key"];

export default function BookingCalendar({ bookingFormRef }: BookingCalendarProps) {
  const [view, setView] = useState<"motive" | "calendar">("motive");
  const [motive, setMotive] = useState<MotiveKey>("universitario");
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 1. Carga (una sola vez) el widget oficial de Calendly.
  useEffect(() => {
    if (!document.querySelector(`link[href="${CALENDLY_WIDGET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CALENDLY_WIDGET_CSS;
      document.head.appendChild(link);
    }

    if ((window as any).Calendly) {
      setScriptLoaded(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CALENDLY_WIDGET_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = CALENDLY_WIDGET_JS;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  // 2. Inicializa el embed in-line al entrar a la vista de calendario,
  //    pre-rellenando la pregunta de preparación con el motivo elegido.
  useEffect(() => {
    if (view !== "calendar" || !scriptLoaded || !calendarRef.current) return;
    const Calendly = (window as any).Calendly;
    if (!Calendly) return;

    const selected = motives.find((m) => m.key === motive);
    calendarRef.current.innerHTML = "";
    Calendly.initInlineWidget({
      url: `${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=0054d4&text_color=1f2937`,
      parentElement: calendarRef.current,
      prefill: {
        customAnswers: { a1: selected?.prep ?? "" }
      },
      utm: { utmContent: motive }
    });
  }, [view, scriptLoaded, motive]);

  return (
    <section
      id="precios"
      ref={bookingFormRef}
      className="bg-[#0054d4] py-16 px-4 sm:px-6 lg:px-8 relative text-white"
    >
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Encabezado */}
        <div className="text-center space-y-3">
          <span className="bg-yellow-300 text-[#0054d4] border-2 border-black font-mono text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            ¡AGENDA TU SESIÓN 1:1 AL INSTANTE!
          </span>
          <h2 className="text-4xl sm:text-5xl font-black font-sans tracking-tight text-white leading-none pt-2">
            Reserva tu Mentoría con Kuni
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-blue-100 font-sans">
            Elige tu perfil, selecciona un horario libre y asegura tu videollamada de 1 hora por Google Meet para trazar tu plan de carrera por solo S/ 30 soles.
          </p>
        </div>

        {/* Tarjeta dinámica */}
        <div className="bg-white text-gray-900 border-4 border-black rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto relative">

          {/* Cabecera de la tarjeta */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-dashed border-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-rose-500 uppercase text-xs border border-rose-400 bg-rose-50 px-2 py-0.5 rounded-full">
                S/30 soles
              </span>
              <span className="font-mono text-xs font-bold text-gray-500">
                Llamada 1:1 de 1 hora
              </span>
            </div>
            <span className="font-mono text-xs font-black text-[#0054d4]">
              {view === "motive" ? "Paso 1 de 2" : "Paso 2 de 2"}
            </span>
          </div>

          {/* PASO 1: SELECCIÓN DE MOTIVO (tu UX original) */}
          {view === "motive" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black font-sans text-gray-900">
                  ⚡ ¿Qué quieres resolver en tu sesión con Kuni?
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Selecciona la opción que mejor se adapte a tu situación. La usaremos para preparar el material antes de reunirnos.
                </p>
              </div>

              <div className="space-y-2">
                {motives.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMotive(m.key);
                      setView("calendar");
                    }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all text-xs font-sans font-semibold cursor-pointer block hover:border-black ${
                      motive === m.key
                        ? "bg-[#eef3fc] text-[#0054d4] border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    id={`booking-motive-btn-${m.key}`}
                  >
                    <div className="font-black text-sm">{m.label}</div>
                    <div className="text-xs text-gray-500 font-normal mt-0.5">{m.sub}</div>
                  </button>
                ))}
              </div>

              {/* Lo que Calendly te garantiza de verdad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                {[
                  { icon: Video, text: "Link de Google Meet automático" },
                  { icon: Mail, text: "Correo de confirmación al instante" },
                  { icon: CalendarCheck, text: "Reagenda o cancela en 1 clic" }
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <Icon className="w-4 h-4 text-[#0054d4] shrink-0" />
                    <span className="text-[11px] font-sans font-semibold text-gray-600 leading-tight">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASO 2: CALENDARIO REAL (embed de Calendly) */}
          {view === "calendar" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setView("motive")}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-bold hover:underline cursor-pointer"
                  id="booking-back-to-motive"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cambiar motivo
                </button>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {motives.find((m) => m.key === motive)?.label}
                </span>
              </div>

              <p className="text-xs text-gray-500 font-sans">
                Disponibilidad real y en tu zona horaria. Elige el día y la hora; al confirmar recibirás el link de Google Meet en tu correo.
              </p>

              {/* Contenedor del widget. Calendly inyecta el iframe aquí. */}
              <div
                ref={calendarRef}
                className="h-[1050px] sm:h-[720px] w-full rounded-2xl overflow-hidden border-2 border-gray-200"
              />

              {!scriptLoaded && (
                <p className="text-center text-xs text-gray-400 font-mono">Cargando calendario…</p>
              )}

              {/* Pago: por ahora manual vía Yape con tu QR / número. */}
              <div className="border-t border-dashed border-gray-300 pt-3 text-[11px] text-gray-500 font-mono text-center">
                💸 La sesión cuesta S/30. Tras agendar, paga con Yape/Plin para confirmar tu cupo (te llegan los datos en el correo).
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
