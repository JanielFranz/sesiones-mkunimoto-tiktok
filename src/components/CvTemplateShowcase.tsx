import React, { useState } from "react";
import { CheckCircle2, FileText, Sparkles, Copy, Check, Download, AlertTriangle } from "lucide-react";

interface CvSection {
  id: string;
  title: string;
  kuniTip: string;
  doLabel: string;
  dontLabel: string;
  recommendedContent: string;
}

export default function CvTemplateShowcase() {
  const [activeSection, setActiveSection] = useState<string>("header");
  const [copied, setCopied] = useState<boolean>(false);

  const cvSections: Record<string, CvSection> = {
    header: {
      id: "header",
      title: "📞 Datos de Contacto y Enlaces",
      kuniTip: "Manya, el correo debe ser serio (ej. tu.nombre@email.com). Olvídate de poner tu dirección exacta, DNI o foto (para evitar sesgos). Lo más importante aquí son tus enlaces: tu GitHub con repositorios públicos y tu LinkedIn limpio.",
      doLabel: "Colocar enlaces directos a tu GitHub, LinkedIn, correo profesional y portafolio en vivo.",
      dontLabel: "No pongas tu dirección completa, DNI, estado civil, foto, ni enlaces rotos.",
      recommendedContent: "Luis Alberto Flores | Lima, Perú | +51 987 654 321 | luis.flores@email.com | github.com/luisfdev | linkedin.com/in/luisfdev"
    },
    summary: {
      id: "summary",
      title: "✍️ Resumen Profesional (Acerca de mí)",
      kuniTip: "¡No uses palabras de relleno como 'proactivo', 'puntual' o 'motivado'! A los reclutadores no les interesa la teoría. Di qué sabes hacer, qué stack manejas y qué tipo de proyectos has construido de forma práctica.",
      doLabel: "Menciona tu especialidad técnica (ej. Frontend Developer), el stack principal y los tipos de proyectos que has completado.",
      dontLabel: "Evita adjetivos vacíos como 'responsable', 'proactivo' o 'con ganas de superación' sin sustento técnico.",
      recommendedContent: "Desarrollador de Software en formación con enfoque en Frontend (React, TypeScript y Tailwind CSS). Creador de clones de aplicaciones en producción y proyectos personales desplegados en la nube. Orientado a escribir código limpio y modularizado."
    },
    projects: {
      id: "projects",
      title: "🚀 Proyectos Destacados (¡El Core de tu CV!)",
      kuniTip: "Si no tienes experiencia laboral real, tus proyectos son tu mejor carta. Coloca exactamente 2 o 3 proyectos bien estructurados en GitHub. Pon el link de producción (Vercel/Render) y el link del repositorio. Explica el problema que resolviste y qué tecnologías usaste.",
      doLabel: "Incluir el link del repositorio y del despliegue en vivo. Explicar brevemente qué hace el proyecto y el stack tecnológico utilizado.",
      dontLabel: "No listes proyectos del colegio/universidad que sean copias exactas de tutoriales (como la clásica calculadora o el To-Do List básico).",
      recommendedContent: "• Clon de Spotify Interactiva (React, Tailwind CSS, API Spotify)\n  - Construcción de interfaz responsiva con reproducción en vivo utilizando la API oficial de Spotify.\n  - Repositorio: github.com/luisfdev/spotify-clone | Demo en vivo: spotify-kuni.vercel.app\n\n• Sistema de Reservas para Negocios (Node.js, Express, MongoDB)\n  - API REST que gestiona horarios y confirmaciones por correo electrónico.\n  - Repositorio: github.com/luisfdev/booking-api | Demo en vivo: booking-kuni.render.com"
    },
    skills: {
      id: "skills",
      title: "🛠️ Habilidades Técnicas",
      kuniTip: "Agrupa tus habilidades de forma ordenada. No pongas barras de porcentaje de conocimiento (ej. 'React 80%'), eso no significa nada. Simplemente categoriza lo que dominas y has usado en proyectos.",
      doLabel: "Categorizar tus habilidades (Lenguajes, Frameworks, Base de Datos, Herramientas).",
      dontLabel: "No pongas programas genéricos como 'Word' u 'Office', ni tecnologías que solo viste en una diapositiva de 5 minutos.",
      recommendedContent: "• Lenguajes: JavaScript (ES6+), TypeScript, HTML5, CSS3, Python\n• Frameworks / Librerías: React, Node.js, Express, Tailwind CSS\n• Bases de Datos: MongoDB, PostgreSQL (Básico)\n• Herramientas: Git, GitHub, VS Code, Vercel, Render, Postman"
    },
    education: {
      id: "education",
      title: "🎓 Educación y Certificaciones",
      kuniTip: "Coloca tu universidad o instituto y tu ciclo actual. Si estás en colegio o recién egresado, ponlo con total honestidad. Complementa con cursos o bootcamps prácticos que demuestren que estudias por tu cuenta.",
      doLabel: "Colocar la institución académica, la carrera, el período y tu ciclo actual de forma clara.",
      dontLabel: "Evita listar tu colegio primario o talleres de 1 hora que no aporten valor técnico al puesto.",
      recommendedContent: "• Bachiller / Estudiante de Ingeniería de Software (Ciclo 4) - Universidad de Ingeniería (UNI) | 2024 - Presente\n• Curso Especializado en React Completo - Platzi / Udemy (120 horas prácticas) | 2025"
    }
  };

  const handleCopyStructure = () => {
    const textToCopy = Object.values(cvSections)
      .map((sec) => `=== ${sec.title} ===\n${sec.recommendedContent}\n`)
      .join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header content */}
        <div className="text-left space-y-3">
          <span className="bg-[#fcfaf3] text-amber-800 border-2 border-amber-400 font-mono text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-[1px_1px_rgba(0,0,0,1)]">
            <FileText className="w-4 h-4 text-amber-600" />
            Estructura Recomendada de CV
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900 leading-none">
            La Plantilla de CV que Sí Abre Puertas Tech
          </h2>
          <p className="max-w-3xl text-sm sm:text-base text-gray-600 font-sans">
            ¿No tienes experiencia laboral? No te paltees. El secreto de un CV Junior o de estudiante está en **cómo presentas tus proyectos y tus habilidades**. Haz clic en las diferentes secciones de esta hoja interactiva para ver la estructura exacta que Kuni recomienda usar.
          </p>
        </div>

        {/* Panel Layout */}
        <div className="bg-[#fcf9f8] border-2 border-black rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive CV Simulator Sheet (Left/Middle) */}
          <div className="lg:col-span-7 bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-sans space-y-4 text-left max-w-full overflow-x-auto relative">
            
            {/* Stamp decoration */}
            <div className="absolute right-4 top-4 bg-[#0054d4] text-white border-2 border-black font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-[1px_1px_rgba(0,0,0,1)] -rotate-3 select-none">
              🎯 ATS-Friendly Layout
            </div>

            {/* Header section (Clickable) */}
            <div
              onClick={() => setActiveSection("header")}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                activeSection === "header"
                  ? "bg-[#eef3fc] border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                  : "border-transparent hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-base text-gray-950">LUCAS ALBERTO FLORES</h3>
                <p className="text-[11px] text-gray-600 font-medium">
                  Lima, Perú | +51 987 654 321 | lucas.flores@email.com
                </p>
                <p className="text-[10px] font-mono text-[#0054d4] font-bold">
                  github.com/lucasfdev | linkedin.com/in/lucasfdev
                </p>
              </div>
            </div>

            {/* Summary section (Clickable) */}
            <div
              onClick={() => setActiveSection("summary")}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-xs leading-relaxed ${
                activeSection === "summary"
                  ? "bg-[#fcf3f8] border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                  : "border-transparent hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <h4 className="font-black text-gray-900 border-b border-gray-200 pb-1 mb-1.5 tracking-wide uppercase text-[10px]">
                Perfil Profesional
              </h4>
              <p className="text-gray-600 font-sans">
                Desarrollador de Software en formación con enfoque en Frontend (React, TypeScript y Tailwind CSS). Creador de clones de aplicaciones en producción y proyectos personales desplegados en la nube...
              </p>
            </div>

            {/* Projects section (Clickable) */}
            <div
              onClick={() => setActiveSection("projects")}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-xs space-y-3 ${
                activeSection === "projects"
                  ? "bg-[#fcfaf3] border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                  : "border-transparent hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <h4 className="font-black text-gray-900 border-b border-gray-200 pb-1 mb-1.5 tracking-wide uppercase text-[10px]">
                Proyectos Personales & Académicos
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-bold text-gray-950 text-[11px]">
                    <span>• Clon de Spotify Interactiva (React, Tailwind CSS)</span>
                    <span className="text-[10px] text-[#0054d4] font-mono">En vivo 🚀</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5 pl-2">
                    Construcción de interfaz responsiva con reproducción real utilizando la API oficial de Spotify.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between font-bold text-gray-950 text-[11px]">
                    <span>• Sistema de Reservas para Negocios (Node, Express, Mongo)</span>
                    <span className="text-[10px] text-[#0054d4] font-mono">En vivo 🚀</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5 pl-2">
                    API REST con gestión de horarios, confirmación de correo y base de datos persistente.
                  </p>
                </div>
              </div>
            </div>

            {/* Skills section (Clickable) */}
            <div
              onClick={() => setActiveSection("skills")}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-xs ${
                activeSection === "skills"
                  ? "bg-[#f4fcf4] border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                  : "border-transparent hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <h4 className="font-black text-gray-900 border-b border-gray-200 pb-1 mb-1.5 tracking-wide uppercase text-[10px]">
                Habilidades Técnicas
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                <div><strong>Lenguajes:</strong> JS (ES6+), TS, HTML, CSS, Python</div>
                <div><strong>Frameworks:</strong> React, Node.js, Express, Tailwind CSS</div>
                <div><strong>Bases de Datos:</strong> MongoDB, PostgreSQL</div>
                <div><strong>Herramientas:</strong> Git, GitHub, Vercel, Render</div>
              </div>
            </div>

            {/* Education section (Clickable) */}
            <div
              onClick={() => setActiveSection("education")}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-xs ${
                activeSection === "education"
                  ? "bg-[#eefcfc] border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                  : "border-transparent hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <h4 className="font-black text-gray-900 border-b border-gray-200 pb-1 mb-1.5 tracking-wide uppercase text-[10px]">
                Educación y Cursos
              </h4>
              <div className="flex justify-between items-start text-[11px]">
                <div>
                  <strong>Estudiante de Ingeniería de Software (Ciclo 4)</strong>
                  <div className="text-gray-500 text-[10px]">Universidad Nacional de Ingeniería (UNI)</div>
                </div>
                <span className="text-[10px] font-mono text-gray-500 font-semibold">2024 - Presente</span>
              </div>
            </div>

          </div>

          {/* Details / Explanation Panel (Right) */}
          <div className="lg:col-span-5 text-left space-y-6">
            
            {/* Active section info container */}
            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
              <span className="text-[9px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Explicación de Sección
              </span>
              
              <h3 className="text-lg font-black font-sans text-gray-950 leading-tight">
                {cvSections[activeSection].title}
              </h3>

              {/* Recommended text representation */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 font-mono uppercase block">Cómo debería verse:</span>
                <pre className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-[10px] font-mono text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {cvSections[activeSection].recommendedContent}
                </pre>
              </div>

              {/* Do's and Don'ts */}
              <div className="space-y-2.5 pt-2">
                <div className="flex gap-2 text-xs">
                  <div className="mt-0.5 text-emerald-500 font-black">✓</div>
                  <p className="text-gray-600 font-sans"><strong className="text-gray-800 font-bold">Qué poner:</strong> {cvSections[activeSection].doLabel}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <div className="mt-0.5 text-red-500 font-black">✗</div>
                  <p className="text-gray-600 font-sans"><strong className="text-gray-800 font-bold">Qué evitar:</strong> {cvSections[activeSection].dontLabel}</p>
                </div>
              </div>

              {/* Kuni Advisor Tip balloon */}
              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-xl text-xs text-amber-900 leading-snug font-sans relative">
                <div className="font-black text-[9px] uppercase text-amber-700 tracking-wider mb-0.5">
                  💡 Kuni Tip:
                </div>
                "{cvSections[activeSection].kuniTip}"
              </div>

            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Copy template contents */}
              <button
                onClick={handleCopyStructure}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-sans font-black text-xs rounded-xl border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center gap-1.5"
                id="cv-copy-structure-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    ¡Estructura Copiada!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar texto guía
                  </>
                )}
              </button>

              {/* Mock Download template */}
              <a
                href="https://docs.google.com/document/d/1XyS_35Lg7N2a0k_a5LOMp-Mv367YkMoc/export?format=docx"
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 bg-yellow-300 hover:bg-yellow-200 text-black font-sans font-black text-xs rounded-xl border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center gap-1.5"
                id="cv-download-doc-btn"
              >
                <Download className="w-4 h-4 text-black" />
                Descargar Plantilla (.docx)
              </a>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
