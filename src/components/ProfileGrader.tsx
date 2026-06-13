import React, { useState } from "react";
import { Sparkles, Star, RefreshCw, Copy, Check, MessageSquare, AlertCircle, ThumbsUp } from "lucide-react";
import { ProfileReviewResponse } from "../types";

export default function ProfileGrader() {
  const [profileText, setProfileText] = useState<string>("");
  const [type, setType] = useState<'linkedin' | 'cv'>("linkedin");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProfileReviewResponse | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const sampleProfiles = {
    linkedin: "Estudiante entusiasta de Ingeniería de Sistemas | Buscando oportunidades de práctica profesional | Proactivo y comprometido.",
    cv: "Soy un joven bachiller con ganas de trabajar en desarrollo. Responsable, honesto y puntual. Domino Word, Excell y conceptos básicos de Python."
  };

  const handleGradeProfile = async () => {
    if (!profileText.trim()) {
      setErr("Por favor escribe o pega algún extracto o resumen.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const response = await fetch("/api/gemini/grade-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileText, type })
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el Revisor IA de Kuni.");
      }

      const resJson = await response.json();
      setResult(resJson.data);
    } catch (error: any) {
      console.error(error);
      setErr(error?.message || "Algo salió mal graduando tu perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadPreset = (presetType: 'linkedin' | 'cv') => {
    setProfileText(sampleProfiles[presetType]);
    setType(presetType);
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score < 45) return "text-red-500 bg-red-50 border-red-300";
    if (score < 70) return "text-amber-500 bg-amber-50 border-amber-300";
    return "text-emerald-500 bg-emerald-50 border-emerald-300";
  };

  const scoreColorBar = (score: number) => {
    if (score < 45) return "bg-red-500";
    if (score < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header content */}
        <div className="text-left space-y-3">
          <span className="bg-pink-100 text-pink-800 border-2 border-pink-400 font-mono text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-[1px_1px_rgba(0,0,0,1)]">
            🌟 feedback de atracción de reclutadores
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-gray-900 leading-none">
            Evaluador de Perfil e Impacto (LinkedIn / CV)
          </h2>
          <p className="max-w-3xl text-sm sm:text-base text-gray-600 font-sans">
            ¿Tu perfil ahuyenta a los reclutadores de software o te hace ver demasiado novato? Pega tu titular de LinkedIn o resumen del CV para recibir una nota de impacto de 0 a 100 y re-escrituras estratégicas recomendadas por Kuni.
          </p>
        </div>

        {/* Grader Panel Layout */}
        <div className="bg-[#fcf9f8] border-2 border-black rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Panel Left */}
          <div className="lg:col-span-5 space-y-5 text-left">
            
            {/* Filter Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-black font-sans uppercase text-gray-700 tracking-wider">
                1. Selección de formato
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("linkedin")}
                  className={`p-3.5 rounded-2xl border-2 text-xs font-sans font-bold cursor-pointer transition-all ${
                    type === "linkedin"
                      ? "bg-[#eef3fc] text-[#0054d4] border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-black"
                  }`}
                  id="toggle-linkedin"
                >
                  🔗 Titular de LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => setType("cv")}
                  className={`p-3.5 rounded-2xl border-2 text-xs font-sans font-bold cursor-pointer transition-all ${
                    type === "cv"
                      ? "bg-amber-50 text-amber-700 border-black shadow-[2px_2px_rgba(0,0,0,1)]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-black"
                  }`}
                  id="toggle-cv"
                >
                  📄 Resumen del CV
                </button>
              </div>
            </div>

            {/* Presets loader */}
            <div className="flex gap-2 items-center text-xs">
              <span className="text-gray-500 font-sans">Presets de muestra:</span>
              <button
                type="button"
                onClick={() => loadPreset("linkedin")}
                className="bg-white border border-gray-300 hover:border-black px-2 py-1 rounded text-gray-700 cursor-pointer text-[11px] font-mono"
              >
                Cargar LinkedIn flojo
              </button>
              <button
                type="button"
                onClick={() => loadPreset("cv")}
                className="bg-white border border-gray-300 hover:border-black px-2 py-1 rounded text-gray-700 cursor-pointer text-[11px] font-mono"
              >
                Cargar CV genérico
              </button>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-black font-sans uppercase text-gray-700 tracking-wider">
                2. Pega tu extracto actual
              </label>
              <textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder="Ej: Estudiante con ganas de aprender nuevas tecnologías. Honesto, responsable y con ganas de trabajar en sistemas."
                className="w-full p-4 border-2 border-black rounded-2xl text-xs font-sans text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0054d4] transition-all"
                rows={5}
                id="profile-grader-textarea"
              />
            </div>

            {/* Grader Action Button */}
            <button
              onClick={handleGradeProfile}
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-sans font-black text-base rounded-2xl border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center flex items-center justify-center gap-2 disabled:bg-gray-400"
              id="profile-grade-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analizando perfil...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                  Calificar perfil y re-escribir
                </>
              )}
            </button>

            {err && (
              <div className="bg-red-50 text-red-600 border border-red-300 rounded-xl p-3 text-xs font-sans">
                {err}
              </div>
            )}
          </div>

          {/* Results Output Right */}
          <div className="lg:col-span-7 h-full flex flex-col justify-center text-left">
            
            {loading ? (
              <div className="w-full py-24 text-center flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-pink-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans font-black text-lg text-gray-900 animate-pulse">
                    Evaluando impacto estratégico en LinkedIn...
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    Kuni AI busca palabras clave, términos clichés y valor real del portafolio.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Score panel */}
                <div className={`p-5 rounded-2xl border-2 border-black shadow-[3px_3px_rgba(0,0,0,1)] flex items-center justify-between ${getScoreColor(result.score)}`}>
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Evaluación de Impacto Tech
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-sans">
                      Impact Score: {result.score}/100
                    </h3>
                    <div className="w-48 bg-gray-200 h-2.5 rounded-full overflow-hidden mt-1.5 border border-black/10">
                      <div className={`h-full ${scoreColorBar(result.score)}`} style={{ width: `${result.score}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-sans">
                      {result.score >= 70 ? "🥇 TOP" : result.score >= 45 ? "🥈 MEDIO" : "❌ FLOJO"}
                    </span>
                  </div>
                </div>

                {/* Positives and Negatives bento block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Positivos */}
                  <div className="bg-emerald-50/50 border border-emerald-300 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-wider">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      Aspectos Positivos
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {result.positives.map((p, i) => (
                        <li key={i} className="text-xs text-gray-700 leading-normal flex gap-1.5">
                          <span className="text-emerald-500">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Negativos */}
                  <div className="bg-red-50/50 border border-red-300 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-red-800 text-xs font-black uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Cosas a eliminar / mejorar
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {result.negatives.map((p, i) => (
                        <li key={i} className="text-xs text-gray-700 leading-normal flex gap-1.5">
                          <span className="text-red-500">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested rewrites */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black font-sans uppercase text-gray-800 tracking-wider">
                    ✍️ Versiones re-escritas listas para usar (Para copiar)
                  </h4>
                  <div className="space-y-4">
                    {result.suggestedRewrites.map((option, idx) => (
                      <div 
                        key={idx}
                        className="bg-white border-2 border-black p-4 rounded-2xl relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all space-y-2"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs font-black font-sans text-[#0054d4] uppercase">
                            Option {idx + 1}: {option.title}
                          </span>
                          <button
                            onClick={() => handleCopyText(`${option.description}\n\n${option.summary}`, idx)}
                            className="text-[11px] font-bold font-mono text-gray-500 hover:text-[#0054d4] border border-gray-300 px-2.5 py-1 rounded bg-gray-50 hover:bg-white flex items-center gap-1 cursor-pointer"
                            id={`copy-option-${idx}`}
                          >
                            {copiedId === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                ¡Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copiar pack
                              </>
                            )}
                          </button>
                        </div>
                        
                        {/* Title Copy representation */}
                        <div className="font-mono text-xs bg-gray-100 p-2 rounded-lg border border-gray-200">
                          <span className="font-bold text-gray-500 text-[10px] uppercase font-mono block">Titular sugerido:</span>
                          <p className="text-gray-800 font-bold">{option.description}</p>
                        </div>

                        {/* Summary Copy representation */}
                        <div className="font-sans text-xs bg-gray-100 p-2 rounded-lg border border-gray-200">
                          <span className="font-bold text-gray-500 text-[10px] uppercase font-mono block">Resumen / Acerca de mí:</span>
                          <p className="text-gray-600 italic">"{option.summary}"</p>
                        </div>

                        <p className="text-[10px] text-gray-500 italic">
                          <span className="font-medium text-[#0054d4]">Por qué funciona:</span> {option.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kuni Advisor text bubble feedback */}
                <div className="relative bg-blue-100 border-2 border-[#0054d4]/30 rounded-2xl p-4 text-xs text-blue-950 font-sans shadow-subtle flex gap-3">
                  <div className="text-xl">💡</div>
                  <div>
                    <span className="font-black font-mono uppercase text-[#0054d4] tracking-wider text-[10px] block mb-1">
                      Kuni Mentorship Brain dice:
                    </span>
                    <p className="leading-relaxed italic">
                      "{result.kuniFeedback}"
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 px-4 space-y-4">
                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl inline-flex">
                  <MessageSquare className="w-12 h-12 text-gray-300" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans font-black text-base text-gray-900">
                    Tu puntaje de impacto aparecerá aquí
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto font-sans">
                    Completa tu extracto actual a la izquierda y presiona el botón calificar para ver qué sugerirá Kuni.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
