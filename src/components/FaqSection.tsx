import React, { useState } from "react";
import { Plus, Minus, HelpCircle, Check } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Cómo se realiza el pago?",
      answer: "Pagas directamente con Yape desde la sección de reservas: eliges tu motivo, ingresas tu celular y el código de aprobación de tu app de Yape (Menú → 'Código de aprobación'), y el pago se valida automáticamente en segundos. Apenas se confirma, se desbloquea el calendario para que elijas tu horario. Sin capturas de pantalla ni esperas."
    },
    {
      question: "¿Qué pasa si no puedo asistir a la sesión agendada?",
      answer: "¡No te preocupes! Entendemos que surgen imprevistos universitarios o escolares. Puedes reprogramar tu sesión de manera totalmente gratuita hasta con 24 horas de anticipación a través del enlace de auto-servicio que te llegará al correo electrónico."
    },
    {
      question: "¿Haces mentoría grupal para proyectos grandes?",
      answer: "Sí, por supuesto. Si estás armando un proyecto grupal de fin de ciclo o una tesis técnica con tus compañeros de clase y necesitan asesoría conjunta, escríbeme directamente por Discord. Tarifas especiales para grupos de hasta 5 integrantes."
    },
    {
      question: "¿La Inteligencia Artificial remplazará a los Ingenieros de Software?",
      answer: "Rpta de Kuni: ¡Para nada, crack! Al revés, la IA es tu supercopiloto. Multiplica por 10 tu rapidez de desarrollo, pero aún necesita un cerebro técnico humano capaz de estructurar las bases lógicas, depurar errores complejos de arquitectura, y tomar decisiones de negocio realistas. En las sesiones te enseño a usarla a tu favor."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-[#fcf9f8] py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-black">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-[#0054d4] mx-auto" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900 leading-none">
            Preguntas Frecuentes
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 font-sans">
            Todo lo que necesitas saber antes de iniciar nuestra primera llamada de orientación tech.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all text-left"
              >
                {/* Trigger Row */}
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="w-full p-5 sm:p-6 flex justify-between items-center text-left font-sans font-black text-sm sm:text-base text-gray-900 cursor-pointer"
                  id={`faq-accordion-trigger-${idx}`}
                >
                  <span className="pr-4">{faq.question}</span>
                  <div className="p-1 border border-black bg-[#fcf9f8] rounded-lg">
                    {isOpen ? <Minus className="w-4 h-4 text-[#0054d4]" /> : <Plus className="w-4 h-4 text-gray-700" />}
                  </div>
                </button>

                {/* Answer Content */}
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 font-sans text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-dashed border-gray-200 bg-gray-50 pt-4 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
