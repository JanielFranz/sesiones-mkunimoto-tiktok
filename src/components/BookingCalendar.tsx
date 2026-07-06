import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowLeft,
  Video,
  Mail,
  CalendarCheck,
  CheckCircle,
  Smartphone,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { CheckoutRequest, CheckoutResponse, HealthResponse } from "../types";

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
type View = "motive" | "pay" | "calendar";

export default function BookingCalendar({ bookingFormRef }: BookingCalendarProps) {
  const [view, setView] = useState<View>("motive");
  const [motive, setMotive] = useState<MotiveKey>("universitario");
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Datos de pago (checkout anónimo: nombre + correo + Yape).
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [paying, setPaying] = useState<boolean>(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Resultado del pago aprobado: link de agenda otorgado por el servidor.
  const [schedulingUrl, setSchedulingUrl] = useState<string | null>(null);

  // Aviso de modo de prueba (solo visible mientras el backend usa el mock).
  const [mockMode, setMockMode] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((h: HealthResponse) => setMockMode(h.paymentMode === "mock"))
      .catch(() => {});
  }, []);

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

  // 2. Inicializa el embed in-line al entrar a la vista de calendario usando el
  //    link entregado por el servidor tras el pago (único si Calendly API está
  //    configurado), pre-rellenando nombre, correo y el motivo elegido.
  useEffect(() => {
    if (view !== "calendar" || !scriptLoaded || !calendarRef.current || !schedulingUrl) return;
    const Calendly = (window as any).Calendly;
    if (!Calendly) return;

    const selected = motives.find((m) => m.key === motive);
    calendarRef.current.innerHTML = "";
    const sep = schedulingUrl.includes("?") ? "&" : "?";
    Calendly.initInlineWidget({
      url: `${schedulingUrl}${sep}hide_gdpr_banner=1&primary_color=0054d4&text_color=1f2937`,
      parentElement: calendarRef.current,
      prefill: {
        name,
        email,
        customAnswers: { a1: selected?.prep ?? "" }
      },
      utm: { utmContent: motive }
    });
  }, [view, scriptLoaded, motive, schedulingUrl, name, email]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setPayError(null);
    try {
      const body: CheckoutRequest = { name, email, phone, otp, motive };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = (await res.json()) as CheckoutResponse;
      if (data.status === "approved") {
        setSchedulingUrl(data.schedulingUrl);
        setView("calendar");
      } else {
        setPayError(data.reason);
        setOtp(""); // el código es de un solo uso y corta vigencia: pedir uno nuevo
      }
    } catch {
      setPayError("No se pudo conectar con el servidor de pagos. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setPaying(false);
    }
  };

  const stepNumber = view === "motive" ? 1 : view === "pay" ? 2 : 3;

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
            Elige tu perfil, paga con Yape de forma segura y agenda al instante tu videollamada de 1 hora por Google Meet. Todo por solo S/ 30 soles.
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
              Paso {stepNumber} de 3
            </span>
          </div>

          {/* PASO 1: SELECCIÓN DE MOTIVO */}
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
                      setView("pay");
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

              {/* Lo que el flujo te garantiza */}
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

          {/* PASO 2: PAGO CON YAPE (código de aprobación) */}
          {view === "pay" && (
            <div className="space-y-5 animate-fade-in text-left">
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

              <div className="space-y-1">
                <h3 className="text-lg font-black font-sans text-gray-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border-2 border-black bg-[#742384] text-white text-[10px] font-black">
                    yape
                  </span>
                  Paga S/30 con Yape
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Abre tu app de Yape → Menú → <strong>"Código de aprobación"</strong> y copia el código de 6 dígitos aquí (dura 2 minutos). El pago se valida automáticamente.
                </p>
              </div>

              {mockMode && (
                <div className="bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl p-3 text-[11px] font-mono text-amber-800">
                  🧪 <strong>Modo de prueba activo</strong> (sin Culqi real). Cualquier código de 6 dígitos aprueba el pago. Prueba <code className="font-bold">000000</code> (fondos insuficientes) o <code className="font-bold">111111</code> (código expirado) para simular rechazos.
                </div>
              )}

              <form onSubmit={handlePay} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 font-sans">Nombre completo *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Sofía Rojas"
                      required
                      className="w-full p-2.5 border-2 border-black rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0054d4]"
                      id="checkout-name-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 font-sans">Correo electrónico *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                      className="w-full p-2.5 border-2 border-black rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0054d4]"
                      id="checkout-email-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 font-sans flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> Celular Yape *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      placeholder="9XXXXXXXX"
                      required
                      className="w-full p-2.5 border-2 border-black rounded-xl text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#0054d4]"
                      id="checkout-phone-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 font-sans flex items-center gap-1">
                      <KeyRound className="w-3 h-3" /> Código de aprobación *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6 dígitos"
                      required
                      className="w-full p-2.5 border-2 border-black rounded-xl text-xs bg-white font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#0054d4]"
                      id="checkout-otp-input"
                    />
                  </div>
                </div>

                {payError && (
                  <div className="bg-red-50 text-red-600 border-2 border-red-300 rounded-xl p-3 text-xs font-sans font-semibold">
                    ⚠️ {payError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-4 bg-[#0054d4] text-white font-sans font-black text-lg rounded-2xl border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
                  id="checkout-pay-btn"
                >
                  {paying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Validando tu pago...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pagar S/30 y desbloquear agenda
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-gray-400 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Validación automática e instantánea. Sin capturas de pantalla ni esperas.
                </p>
              </form>
            </div>
          )}

          {/* PASO 3: CALENDARIO (desbloqueado tras el pago aprobado) */}
          {view === "calendar" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
                <div className="text-left">
                  <p className="font-sans font-black text-sm text-emerald-800">
                    ¡Pago confirmado, {name.split(" ")[0] || "crack"}! 🎉
                  </p>
                  <p className="text-xs text-emerald-700 font-sans">
                    Tu cupo está asegurado. Ahora elige el día y la hora para tu sesión; el link de Google Meet llegará a <strong>{email}</strong>.
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 font-sans text-left">
                Disponibilidad real y en tu zona horaria. Al confirmar recibirás el correo de Calendly con el link de la videollamada.
              </p>

              {/* Contenedor del widget. Calendly inyecta el iframe aquí. */}
              <div
                ref={calendarRef}
                className="h-[1050px] sm:h-[720px] w-full rounded-2xl overflow-hidden border-2 border-gray-200"
              />

              {!scriptLoaded && (
                <p className="text-center text-xs text-gray-400 font-mono">Cargando calendario…</p>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
