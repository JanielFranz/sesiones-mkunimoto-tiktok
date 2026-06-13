import React, { useState } from "react";
import { Calendar, Clock, CheckCircle, Disc, Sparkles, MessageSquare, Terminal, Ticket, X } from "lucide-react";
import { Booking } from "../types";

interface BookingCalendarProps {
  onClose?: () => void;
  bookingFormRef?: React.RefObject<HTMLDivElement>;
}

export default function BookingCalendar({ onClose, bookingFormRef }: BookingCalendarProps) {
  const [step, setStep] = useState<number>(1);
  const [motive, setMotive] = useState<'secundaria' | 'universitario' | 'reconversion' | 'general'>("universitario");
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-15");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [customDetails, setCustomDetails] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingTicket, setBookingTicket] = useState<Booking | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const motives = [
    { key: "secundaria", label: "🎒 Colegio (4to/5to Sec)", sub: "Orientación básica y dudas iniciales" },
    { key: "universitario", label: "🎓 Universidad/Inst (1-2 ciclo)", sub: "Desbloquear cursos complejos de progra" },
    { key: "reconversion", label: "💼 Reconversión Laboral", subtitle: "Ruta de habilidades y portafolio técnico" },
    { key: "general", label: "⚡ mentoría General Tech", subtitle: "Revisión de proyectos y consejos libres" }
  ];

  const futureDates = [
    { value: "2026-06-15", label: "Lunes 15 Jun", day: "Lun" },
    { value: "2026-06-16", label: "Martes 16 Jun", day: "Mar" },
    { value: "2026-06-17", label: "Miércoles 17 Jun", day: "Mié" },
    { value: "2026-06-18", label: "Jueves 18 Jun", day: "Jue" },
    { value: "2026-06-19", label: "Viernes 19 Jun", day: "Vie" }
  ];

  const timeSlots = [
    "09:00 AM - 09:45 AM",
    "10:30 AM - 11:15 AM",
    "02:00 PM - 02:45 PM",
    "03:30 PM - 04:15 PM",
    "05:00 PM - 05:45 PM"
  ];

  const handleBookingSubmit = async () => {
    if (!name || !email) {
      setErr("Por favor ingresa tu nombre y correo electrónico.");
      return;
    }
    if (!selectedSlot) {
      setErr("Por favor selecciona un horario de sesión.");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          discordId,
          date: selectedDate,
          timeSlot: selectedSlot,
          motive,
          customDetails
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo agendar en el calendario. Revisa tu conexión.");
      }

      const resBooking: Booking = await response.json();
      setBookingTicket(resBooking);
      setStep(4);
    } catch (error: any) {
      console.error(error);
      setErr(error?.message || "Ocurrió un error procesando la reserva.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedSlot("");
    setName("");
    setEmail("");
    setDiscordId("");
    setCustomDetails("");
    setBookingTicket(null);
    setErr(null);
  };

  return (
    <section 
      id="precios" 
      ref={bookingFormRef}
      className="bg-[#0054d4] py-16 px-4 sm:px-6 lg:px-8 relative text-white"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header section content with price card integration */}
        <div className="text-center space-y-3">
          <span className="bg-yellow-300 text-[#0054d4] border-2 border-black font-mono text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            ¡INVERSIÓN ÚNICA POR SESIÓN!
          </span>
          <h2 className="text-4xl sm:text-5xl font-black font-sans tracking-tight text-white leading-none pt-2">
            Tu camino al éxito
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-blue-100 font-sans">
            Ruta paso a paso: Selecciona tu etapa, agenda una fecha ideal, y reunámonos para trazar tu roadmap exitoso por solo S/ 30 soles peruanos.
          </p>
        </div>

        {/* Dynamic Card Container */}
        <div className="bg-white text-gray-905 border-4 border-black rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto text-gray-900 relative">
          
          {/* Header indicator in card */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-dashed border-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-rose-500 uppercase text-xs border border-rose-400 bg-rose-50 px-2 py-0.5 rounded-full">
                S/30 soles
              </span>
              <span className="font-mono text-xs font-bold text-gray-500">
                Llamada de 45 mins
              </span>
            </div>
            
            {/* Steps counters */}
            {step < 4 && (
              <span className="font-mono text-xs font-black text-[#0054d4]">
                Paso {step} de 3
              </span>
            )}
          </div>

          {/* STEP 1: SELECT STUDY MOTIVE */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black font-sans text-gray-900">
                  ¿Cuál es el motivo de tu asesoría?
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Para poder adaptar mejor los consejos y el enfoque de las herramientas de la reunión.
                </p>
              </div>

              <div className="space-y-2">
                {motives.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMotive(m.key as any);
                      setStep(2);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all text-xs font-sans font-semibold cursor-pointer block hover:border-black ${
                      motive === m.key
                        ? "bg-[#eef3fc] text-[#0054d4] border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    id={`booking-motive-btn-${m.key}`}
                  >
                    <div className="font-black text-sm">{m.label}</div>
                    <div className="text-xs text-gray-500 font-normal mt-0.5">{m.sub || m.subtitle}</div>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-[#0054d4] text-white font-sans font-bold text-sm rounded-full border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[3px_3px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-1.5"
                  id="booking-motive-next"
                >
                  Siguiente paso
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black font-sans text-gray-900">
                  Elige fecha y hora perfecta
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Nuestra agenda está sincronizada en tiempo real. Selecciona un horario libre abajo:
                </p>
              </div>

              {/* Day badges */}
              <div className="space-y-2">
                <span className="text-[11px] font-black font-sans uppercase text-gray-400 block tracking-wider">
                  Semanas Disponibles:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {futureDates.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDate(d.value)}
                      className={`py-3 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
                        selectedDate === d.value
                          ? "bg-[#0054d4] text-white border-black font-bold shadow-[2px_2px_rgba(0,0,0,1)] -translate-y-0.5"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:border-black font-medium"
                      }`}
                      id={`booking-date-btn-${d.value}`}
                    >
                      <span className="text-[10px] uppercase font-mono block text-gray-400 group-hover:text-white" style={{ color: selectedDate === d.value ? 'white' : undefined }}>{d.day}</span>
                      <span className="text-xs font-black">{d.label.split(" ")[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots selector */}
              <div className="space-y-2">
                <span className="text-[11px] font-black font-sans uppercase text-gray-400 block tracking-wider">
                  Horarios Disponibles (GTM-5 Hora de Perú):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border text-left transition-all text-xs font-sans font-bold cursor-pointer flex items-center justify-between ${
                        selectedSlot === slot
                          ? "bg-pink-50 text-pink-700 border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                          : "bg-white border-gray-200 text-gray-700 hover:border-black"
                      }`}
                      id={`booking-slot-btn-${slot.replace(/\s+/g, '')}`}
                    >
                      <span>{slot}</span>
                      {selectedSlot === slot && <CheckCircle className="w-3.5 h-3.5 text-pink-500 fill-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Back / Next buttons */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 font-bold hover:underline cursor-pointer"
                  id="booking-date-back"
                >
                  ← Regresar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedSlot}
                  className="px-6 py-3 bg-[#0054d4] text-white font-sans font-bold text-sm rounded-full border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[3px_3px_rgba(0,0,0,1)] cursor-pointer disabled:bg-gray-200 disabled:shadow-none"
                  id="booking-date-next"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: USER INFORMATION FORM */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black font-sans text-gray-900">
                  Completa tu registro de sesión
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Ingresa tus datos reales para que Kuni te envíe el enlace de la videollamada de Discord o Google Meet.
                </p>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black font-sans uppercase text-gray-500 tracking-wider">Nombre Completo *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Mateo Flores"
                      className="w-full p-3 border-2 border-black rounded-xl text-xs font-sans focus:ring-1 focus:ring-[#0054d4] focus:outline-none"
                      id="input-booking-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black font-sans uppercase text-gray-500 tracking-wider">Correo Electrónico *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mateo@ejemplo.com"
                      className="w-full p-3 border-2 border-black rounded-xl text-xs font-sans focus:ring-1 focus:ring-[#0054d4] focus:outline-none"
                      id="input-booking-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black font-sans uppercase text-gray-500 tracking-wider">Discord ID (Opcional)</label>
                    <input
                      type="text"
                      value={discordId}
                      onChange={(e) => setDiscordId(e.target.value)}
                      placeholder="Usuario#0000"
                      className="w-full p-3 border-2 border-black rounded-xl text-xs font-sans focus:outline-none"
                      id="input-booking-discord"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black font-sans uppercase text-gray-500 tracking-wider">Método de Pago (Simulado)</label>
                    <select
                      className="w-full p-3 border-2 border-black rounded-xl text-xs font-sans bg-gray-50 focus:outline-none"
                      id="input-booking-payment"
                    >
                      <option>Pago presencial vía Yape/Plin (S/30)</option>
                      <option>Transferencia BCP / BBVA (S/30)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black font-sans uppercase text-gray-500 tracking-wider">¿Qué esperas lograr en esta sesión? (Opcional)</label>
                  <textarea
                    value={customDetails}
                    onChange={(e) => setCustomDetails(e.target.value)}
                    placeholder="Cuéntanos brevemente sobre qué proyectos quieres revisar o tus dudas académicas."
                    className="w-full p-3 border-2 border-black rounded-xl text-xs font-sans focus:outline-none"
                    rows={2}
                    id="input-booking-details"
                  />
                </div>
              </div>

              {/* Errs */}
              {err && (
                <div className="bg-red-50 text-red-600 border border-red-300 rounded-xl p-3 text-xs font-sans">
                  {err}
                </div>
              )}

              {/* Back / Submit buttons */}
              <div className="pt-2 flex justify-between items-center border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-gray-500 font-bold hover:underline cursor-pointer"
                  id="booking-info-back"
                >
                  ← Regresar
                </button>
                <button
                  type="button"
                  onClick={handleBookingSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-[#0054d4] text-white font-sans font-extrabold text-sm rounded-full border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[3px_3px_rgba(0,0,0,1)] cursor-pointer disabled:bg-gray-400"
                  id="booking-info-submit"
                >
                  {loading ? "Agendando..." : "Confirmar Agenda y Reservar"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TICKETING SUCCESS CONFIRMATION */}
          {step === 4 && bookingTicket && (
            <div className="space-y-6 animate-fade-in text-center py-4">
              
              <div className="inline-flex p-3 bg-emerald-100 border-2 border-emerald-400 rounded-full text-emerald-600 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black font-sans text-gray-900">
                  ¡Reserva Recibida con Éxito!
                </h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto font-sans leading-relaxed">
                  Ya tienes tu espacio asegurado, crack. Tu ticket de videollamada ha sido registrado en nuestra cola de Discord.
                </p>
              </div>

              {/* Neo Brutalist Ticket Layout */}
              <div className="border-4 border-black bg-[#fcfaf3] rounded-3xl p-5 mx-auto max-w-sm text-left relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                
                {/* Visual side holes of typical classic ticket */}
                <div className="absolute left-[-16px] top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-white border-r-4 border-black" />
                <div className="absolute right-[-16px] top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-white border-l-4 border-black" />

                <div className="flex justify-between items-center border-b-2 border-dashed border-gray-400 pb-3 font-mono text-[11px] font-black text-[#0054d4]">
                  <span>ADVISOR: @kunidevs</span>
                  <Ticket className="w-4 h-4" />
                </div>

                <div className="py-4 space-y-2.5 font-sans">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Para:</span>
                    <span className="text-xs font-bold text-gray-800">{bookingTicket.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Día:</span>
                    <span className="text-xs font-bold text-gray-800">{bookingTicket.date}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Horario:</span>
                    <span className="text-xs font-bold text-gray-800">{bookingTicket.timeSlot}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Código ticket:</span>
                    <span className="text-xs font-black font-mono text-pink-600">{bookingTicket.code}</span>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-400 pt-3 text-[10px] text-gray-500 font-mono text-center">
                  ⚠️ Paga con Yape ó BCP usando tu código ticket. El link será enviado a {bookingTicket.email}.
                </div>

              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2 bg-slate-900 border-2 border-black text-white font-sans font-bold text-xs rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                  id="booking-ticket-close"
                >
                  Agendar otra sesión
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
