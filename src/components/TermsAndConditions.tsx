import React, { useEffect } from "react";
import { ArrowLeft, ShieldCheck, Ban, CalendarClock, Scale, Calendar } from "lucide-react";

interface TermsAndConditionsProps {
  onBack: () => void;
  onOpenBooking: () => void;
}

/**
 * Página legal de Términos y Condiciones del servicio de mentoría Kuni.
 * Se renderiza como una "vista" completa (no una sección más del landing):
 * App.tsx alterna entre el home y esta página mediante estado, sin router.
 * Punto clave del negocio: el pago de la sesión NO es reembolsable.
 */
export default function TermsAndConditions({ onBack, onOpenBooking }: TermsAndConditionsProps) {
  // Al entrar a la página legal siempre partimos desde el inicio del documento.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const sections = [
    {
      title: "1. Aceptación de los términos",
      body: [
        "Al reservar y pagar una sesión de mentoría con Kuni (\"el Servicio\"), declaras que has leído, entendido y aceptado estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno de ellos, por favor no realices el pago ni agendes una sesión.",
        "Estos términos constituyen un acuerdo entre tú (\"el Usuario\") y Kuni Devs Perú (\"Kuni\", \"nosotros\")."
      ]
    },
    {
      title: "2. Descripción del servicio",
      body: [
        "Kuni ofrece sesiones de mentoría y orientación tecnológica de carácter educativo, dictadas de forma individual (1 a 1). Cada sesión tiene una duración de 60 minutos y se realiza de manera 100% virtual a través de Google Meet.",
        "El Servicio está dirigido exclusivamente a tres públicos: estudiantes de 4to y 5to de secundaria, estudiantes de los primeros ciclos de universidad o instituto, y personas en proceso de reconversión laboral hacia el sector tecnológico.",
        "El contenido de cada sesión (plan de ruta, recomendaciones y recursos) es orientativo y personalizado según el momento del Usuario."
      ]
    },
    {
      title: "3. Precio y forma de pago",
      body: [
        "El precio de cada sesión es de S/ 30.00 (treinta soles), pago único, sin suscripciones ni cargos recurrentes.",
        "El pago se realiza de forma anticipada a través de Yape, usando el código de aprobación de la aplicación. El agendamiento del horario recién se habilita una vez que el pago ha sido validado y aprobado. Ningún horario queda reservado sin el pago confirmado."
      ]
    },
    {
      title: "4. Política de no reembolso",
      highlight: true,
      body: [
        "El pago de la sesión NO es reembolsable bajo ninguna circunstancia. Al completar el pago, el Usuario reserva de forma exclusiva un espacio de tiempo y la dedicación del mentor, por lo que no se realizan devoluciones totales ni parciales del monto abonado.",
        "Esto aplica incluso si el Usuario no se presenta a la sesión (no-show), llega tarde, o decide no continuar. En lugar de un reembolso, el Usuario cuenta con la posibilidad de reprogramar su sesión conforme a la sección 5, de modo que nunca pierda el valor de su pago."
      ]
    },
    {
      title: "5. Reprogramación y cancelación",
      body: [
        "El Usuario puede reprogramar su sesión de forma gratuita hasta con 24 horas de anticipación al horario agendado, utilizando el enlace de auto-servicio que recibe en su correo electrónico.",
        "Si el Usuario no se presenta a la sesión sin haber reprogramado con la anticipación indicada (no-show), o cancela con menos de 24 horas de anticipación, la sesión se dará por consumida y no habrá lugar a reembolso ni a una nueva sesión de cortesía.",
        "Kuni se reserva el derecho de reprogramar una sesión por motivos de fuerza mayor, coordinando con el Usuario un nuevo horario sin costo adicional."
      ]
    },
    {
      title: "6. Naturaleza del servicio y ausencia de garantías",
      body: [
        "El Servicio es de carácter educativo y de orientación. Kuni comparte experiencia, guía y recomendaciones, pero NO garantiza resultados específicos tales como la obtención de un empleo, prácticas, admisión a una universidad, aprobación de cursos, aumentos salariales ni ningún otro resultado profesional o académico.",
        "Los resultados dependen del esfuerzo, dedicación y circunstancias individuales de cada Usuario. Las recomendaciones brindadas no constituyen asesoría legal, financiera ni psicológica profesional."
      ]
    },
    {
      title: "7. Usuarios menores de edad",
      body: [
        "Dado que parte de nuestro público son estudiantes de secundaria, si el Usuario es menor de edad debe contar con el consentimiento y acompañamiento de su padre, madre o apoderado para reservar y participar en las sesiones. El adulto responsable acepta estos términos en representación del menor.",
        "Kuni realiza sesiones de contenido estrictamente educativo y en un entorno respetuoso."
      ]
    },
    {
      title: "8. Conducta del usuario",
      body: [
        "El Usuario se compromete a proporcionar información veraz al momento de reservar, a asistir a la sesión en un entorno adecuado y a mantener un trato respetuoso durante la misma.",
        "Kuni podrá dar por terminada una sesión, sin derecho a reembolso, ante cualquier conducta abusiva, ofensiva o que impida el normal desarrollo de la mentoría."
      ]
    },
    {
      title: "9. Propiedad intelectual",
      body: [
        "Todo el material, contenido, metodología, planes de ruta y recursos compartidos por Kuni durante o después de la sesión son de su propiedad y se entregan para uso personal y no comercial del Usuario.",
        "Queda prohibida la grabación, reproducción, redistribución o reventa del contenido de las sesiones sin autorización previa y por escrito de Kuni."
      ]
    },
    {
      title: "10. Protección de datos personales",
      body: [
        "Los datos personales que el Usuario proporciona (nombre, correo electrónico y número de celular) se utilizan únicamente para procesar el pago, agendar la sesión y enviar el enlace de la videollamada, de conformidad con la Ley N° 29733, Ley de Protección de Datos Personales del Perú, y su reglamento.",
        "Kuni no vende ni comparte estos datos con terceros con fines comerciales. El Usuario puede solicitar el acceso, rectificación o eliminación de sus datos escribiendo a nuestro canal de contacto."
      ]
    },
    {
      title: "11. Servicios de terceros",
      body: [
        "El Servicio se apoya en plataformas de terceros: Yape / Mercado Pago para el procesamiento de pagos, Calendly para el agendamiento y Google Meet para la videollamada.",
        "Kuni no se responsabiliza por fallas, interrupciones o cambios en dichas plataformas. El uso de las mismas se rige además por sus propios términos y políticas de privacidad."
      ]
    },
    {
      title: "12. Limitación de responsabilidad",
      body: [
        "En la máxima medida permitida por la ley, la responsabilidad total de Kuni frente al Usuario por cualquier reclamo relacionado con el Servicio se limita al monto efectivamente pagado por la sesión correspondiente (S/ 30.00).",
        "Kuni no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del Servicio."
      ]
    },
    {
      title: "13. Modificaciones de los términos",
      body: [
        "Kuni podrá actualizar estos Términos y Condiciones en cualquier momento. La versión vigente será siempre la publicada en este sitio web, con su respectiva fecha de última actualización. El pago de una nueva sesión implica la aceptación de la versión vigente en ese momento."
      ]
    },
    {
      title: "14. Ley aplicable y jurisdicción",
      body: [
        "Estos Términos y Condiciones se rigen e interpretan de acuerdo con las leyes de la República del Perú. Cualquier controversia derivada del Servicio se someterá a la jurisdicción de los jueces y tribunales de Lima, Perú."
      ]
    },
    {
      title: "15. Contacto",
      body: [
        "Para cualquier consulta relacionada con estos términos, tu reserva o tus datos personales, puedes escribirnos a través de los canales oficiales de Kuni Devs Perú."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col selection:bg-yellow-300 selection:text-black">
      {/* Barra superior simple con logo y botón de retorno */}
      <header className="sticky top-0 z-50 w-full bg-[#fcf9f8] border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="bg-[#0054d4] text-white p-1.5 rounded-lg border-2 border-black font-extrabold text-xl font-sans tracking-tight">
              K
            </div>
            <span className="text-2xl font-black font-sans tracking-tight text-gray-900">
              Kuni<span className="text-[#0054d4]">.</span>
            </span>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-white text-gray-900 font-sans font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            id="terms-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </header>

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Encabezado */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#0054d4] text-white text-[11px] font-mono font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border-2 border-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              Documento legal
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900 leading-none">
              Términos y Condiciones
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-sans max-w-2xl">
              Condiciones que rigen las sesiones de mentoría 1 a 1 de Kuni Devs Perú. Léelas antes de reservar; al pagar tu sesión las aceptas.
            </p>
            <p className="text-xs font-mono text-gray-500">
              Última actualización: 13 de julio de 2026
            </p>
          </div>

          {/* Aviso destacado de no reembolso (resumen visual) */}
          <div className="bg-red-50 border-2 border-black rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-4">
            <div className="p-2 bg-white border-2 border-black rounded-xl shrink-0">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black font-sans text-gray-900">
                Importante: el pago no es reembolsable
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 font-sans leading-relaxed">
                Al reservar apartas un horario exclusivo con el mentor. Por eso el monto de S/ 30 no se devuelve; pero si no puedes asistir, reprogramas gratis hasta 24 horas antes y no pierdes tu sesión.
              </p>
            </div>
          </div>

          {/* Cuerpo del documento */}
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <section
                key={idx}
                className={`rounded-2xl border-2 border-black p-5 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  section.highlight ? "bg-amber-50" : "bg-white"
                }`}
              >
                <h2 className="flex items-center gap-2 text-base sm:text-lg font-black font-sans text-gray-900 mb-3">
                  {section.highlight && <CalendarClock className="w-5 h-5 text-amber-600 shrink-0" />}
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.body.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* CTA final para volver a reservar */}
          <div className="bg-slate-950 rounded-2xl border-2 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
            <Scale className="w-7 h-7 text-[#0054d4] mx-auto" />
            <p className="text-sm sm:text-base text-slate-300 font-sans max-w-lg mx-auto">
              ¿Ya lo tienes claro, crack? Reserva tu sesión 1 a 1 y demos el siguiente paso en tu ruta tech.
            </p>
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 bg-[#0054d4] text-white font-sans font-bold text-sm px-6 py-3 rounded-full border-2 border-white hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)]"
              id="terms-book-btn"
            >
              <Calendar className="w-4 h-4" />
              Reservar mi sesión (S/30)
            </button>
          </div>
        </div>
      </main>

      {/* Pie mínimo */}
      <footer className="bg-slate-950 text-slate-400 py-6 px-4 border-t-2 border-black">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-300 font-black">Kuni Devs PERÚ</span>
          <span>© 2026 · Todos los derechos reservados</span>
        </div>
      </footer>
    </div>
  );
}
