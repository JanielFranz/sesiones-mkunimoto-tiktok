import { describe, it, expect } from "vitest";
import { buildRoadmap } from "../src/components/RoadmapBuilder.js";

// buildRoadmap(stage, role, doubt) is a pure, deterministic, no-AI generator.
// Its output is composed entirely from three curated local maps in the source:
//   ROLE_ROADMAPS[role]  → { roleName, steps }  (fallback: frontend)
//   STAGE_LABEL[stage]   → summary fragment      (fallback: "estás empezando en tecnología")
//   STAGE_FINAL_ADVICE[stage] → kuniFinalAdvice  (fallback: universidad_inicial)
// All expected copy below is copied verbatim from RoadmapBuilder.tsx.

describe("buildRoadmap — role mapping", () => {
  it("maps the known 'frontend' role to its exact roleName with a 3-step roadmap", () => {
    const r = buildRoadmap("secundaria", "frontend", "");
    expect(r.roleName).toBe("Desarrollador Front-End");
    expect(r.steps).toHaveLength(3);
  });

  it("maps 'backend' to its exact roleName with 3 steps", () => {
    const r = buildRoadmap("secundaria", "backend", "");
    expect(r.roleName).toBe("Desarrollador Back-End");
    expect(r.steps).toHaveLength(3);
  });

  it("maps 'datascience' to its exact roleName with 3 steps", () => {
    const r = buildRoadmap("secundaria", "datascience", "");
    expect(r.roleName).toBe("Data Dev / Analista de Datos");
    expect(r.steps).toHaveLength(3);
  });

  it("maps 'ia_engineer', 'mobile', and 'game' to their exact roleNames with 3 steps each", () => {
    expect(buildRoadmap("secundaria", "ia_engineer", "").roleName).toBe("IA Engineer");
    expect(buildRoadmap("secundaria", "mobile", "").roleName).toBe("Desarrollador de Apps Móviles");
    expect(buildRoadmap("secundaria", "game", "").roleName).toBe("Desarrollador de Videojuegos");
    for (const role of ["ia_engineer", "mobile", "game"]) {
      expect(buildRoadmap("secundaria", role, "").steps).toHaveLength(3);
    }
  });

  it("falls back to the frontend roadmap for an unknown role", () => {
    const unknown = buildRoadmap("secundaria", "zzz", "");
    const frontend = buildRoadmap("secundaria", "frontend", "");
    expect(unknown.roleName).toBe("Desarrollador Front-End");
    expect(unknown.roleName).toBe(frontend.roleName);
    expect(unknown.steps).toEqual(frontend.steps);
    // The fallback must also flow into the summary, not just the roleName field.
    expect(unknown.summary).toContain("apuntas a Desarrollador Front-End");
  });

  it("surfaces the chosen roleName inside the summary", () => {
    const r = buildRoadmap("secundaria", "backend", "");
    expect(r.summary).toContain("apuntas a Desarrollador Back-End");
  });
});

describe("buildRoadmap — stage mapping", () => {
  it("uses the fallback stage label AND fallback (universidad_inicial) final advice for an unknown stage", () => {
    const r = buildRoadmap("zzz", "frontend", "");
    // Fallback stage label, accents intact, appears in the summary.
    expect(r.summary).toContain("estás empezando en tecnología");
    // Non-obvious invariant: the LABEL fallback is its own hardcoded string, NOT
    // universidad_inicial's label — even though the ADVICE fallback IS
    // universidad_inicial's. A "simplification" collapsing both to one stage
    // would regress here.
    expect(r.summary).not.toContain("estás en tus primeros ciclos de universidad o instituto");
    // Fallback final advice is exactly the universidad_inicial advice.
    const uni = buildRoadmap("universidad_inicial", "frontend", "");
    expect(r.kuniFinalAdvice).toBe(uni.kuniFinalAdvice);
    expect(r.kuniFinalAdvice).toContain("La U te da la teoría");
    // And it is NOT one of the other stages' advice.
    expect(r.kuniFinalAdvice).not.toBe(buildRoadmap("secundaria", "frontend", "").kuniFinalAdvice);
    expect(r.kuniFinalAdvice).not.toBe(buildRoadmap("reconversion", "frontend", "").kuniFinalAdvice);
  });

  it("uses the secundaria label + advice for the secundaria stage", () => {
    const r = buildRoadmap("secundaria", "frontend", "");
    expect(r.summary).toContain("estás en el colegio (4to/5to de secundaria)");
    expect(r.kuniFinalAdvice).toContain("No necesitas esperar a terminar el colegio para arrancar");
    // A known stage must NOT leak the fallback label, and its advice must not be
    // the fallback (universidad_inicial) advice.
    expect(r.summary).not.toContain("estás empezando en tecnología");
    expect(r.kuniFinalAdvice).not.toContain("La U te da la teoría");
  });

  it("uses the universidad_inicial label + advice for that stage", () => {
    const r = buildRoadmap("universidad_inicial", "frontend", "");
    expect(r.summary).toContain("estás en tus primeros ciclos de universidad o instituto");
    expect(r.kuniFinalAdvice).toContain("La U te da la teoría; los proyectos reales te dan el trabajo");
  });

  it("uses the reconversion label + advice for that stage", () => {
    const r = buildRoadmap("reconversion", "frontend", "");
    expect(r.summary).toContain("estás dando el salto a tech desde otra carrera o rubro");
    expect(r.kuniFinalAdvice).toContain("Cambiar de rubro asusta, pero tus habilidades previas");
  });
});

describe("buildRoadmap — doubt branch", () => {
  it("embeds a non-empty doubt (quoted) in the summary", () => {
    const r = buildRoadmap("secundaria", "frontend", "me da miedo la matematica");
    expect(r.summary).toContain('Sobre tu duda ("me da miedo la matematica"): tranquilo, es de las más comunes que escucho y tiene solución.');
    // Branch exclusivity: the doubt branch and the "simplemente empezar" branch
    // are mutually exclusive — a bug emitting both would pass a positive-only check.
    expect(r.summary).not.toContain("simplemente empezar");
  });

  it("trims surrounding whitespace off the quoted doubt", () => {
    const r = buildRoadmap("secundaria", "frontend", "  no sé por dónde empezar  ");
    expect(r.summary).toContain('Sobre tu duda ("no sé por dónde empezar"):');
  });

  it("uses the 'simplemente empezar' branch for an empty doubt", () => {
    const r = buildRoadmap("secundaria", "frontend", "");
    expect(r.summary).toContain("Tu principal reto ahora es simplemente empezar de forma ordenada, y para eso está esta ruta.");
  });

  it("uses the 'simplemente empezar' branch for a whitespace-only doubt", () => {
    const r = buildRoadmap("secundaria", "frontend", "   ");
    expect(r.summary).toContain("Tu principal reto ahora es simplemente empezar de forma ordenada, y para eso está esta ruta.");
    // And it does NOT emit the quoted-doubt phrasing.
    expect(r.summary).not.toContain("Sobre tu duda");
  });
});

describe("buildRoadmap — full summary composition", () => {
  // The summary is a single template stitching together the opening, the stage
  // label, the roleName joiner (" y apuntas a "), the doubt line, and a fixed
  // tail. The fragment-level toContain tests above leave the opening and the
  // whole tail unpinned; these lock the exact end-to-end string for BOTH doubt
  // branches so a change to any connective copy fails the suite.
  it("pins the exact summary for the non-empty-doubt branch (stage + role + doubt woven in order)", () => {
    const r = buildRoadmap("secundaria", "frontend", "me da miedo la matematica");
    expect(r.summary).toBe(
      '¡Hola crack! Analicé tu caso: estás en el colegio (4to/5to de secundaria) y apuntas a Desarrollador Front-End. ' +
        'Sobre tu duda ("me da miedo la matematica"): tranquilo, es de las más comunes que escucho y tiene solución. ' +
        "Aquí te armé una ruta práctica de 3 pasos, sin teoría de relleno y enfocada en proyectos reales. ¡Vamos con todo!"
    );
  });

  it("pins the exact summary for the empty-doubt branch (different stage + role)", () => {
    const r = buildRoadmap("reconversion", "game", "");
    expect(r.summary).toBe(
      "¡Hola crack! Analicé tu caso: estás dando el salto a tech desde otra carrera o rubro y apuntas a Desarrollador de Videojuegos. " +
        "Tu principal reto ahora es simplemente empezar de forma ordenada, y para eso está esta ruta. " +
        "Aquí te armé una ruta práctica de 3 pasos, sin teoría de relleno y enfocada en proyectos reales. ¡Vamos con todo!"
    );
  });
});

describe("buildRoadmap — step content integrity", () => {
  const EXPECTED_ROLE_NAMES: Record<string, string> = {
    frontend: "Desarrollador Front-End",
    backend: "Desarrollador Back-End",
    datascience: "Data Dev / Analista de Datos",
    ia_engineer: "IA Engineer",
    mobile: "Desarrollador de Apps Móviles",
    game: "Desarrollador de Videojuegos"
  };

  it("gives every role exactly 3 well-formed steps (not just an arbitrary length-3 array)", () => {
    for (const [role, roleName] of Object.entries(EXPECTED_ROLE_NAMES)) {
      const r = buildRoadmap("secundaria", role, "");
      expect(r.roleName).toBe(roleName);
      expect(r.steps).toHaveLength(3);
      for (const step of r.steps) {
        expect(typeof step.title).toBe("string");
        expect(step.title.length).toBeGreaterThan(0);
        expect(typeof step.duration).toBe("string");
        expect(step.duration.length).toBeGreaterThan(0);
        expect(typeof step.description).toBe("string");
        expect(step.description.length).toBeGreaterThan(0);
        expect(typeof step.kuniTip).toBe("string");
        expect(step.kuniTip.length).toBeGreaterThan(0);
        expect(Array.isArray(step.skillsToLearn)).toBe(true);
        expect(step.skillsToLearn.length).toBeGreaterThan(0);
        for (const skill of step.skillsToLearn) {
          expect(typeof skill).toBe("string");
          expect(skill.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("maps distinct roles to distinct roadmaps (roles do not all share one steps array)", () => {
    const firstStepTitles = Object.keys(EXPECTED_ROLE_NAMES).map(
      (role) => buildRoadmap("secundaria", role, "").steps[0].title
    );
    expect(new Set(firstStepTitles).size).toBe(Object.keys(EXPECTED_ROLE_NAMES).length);
  });
});

describe("buildRoadmap — shape & determinism", () => {
  it("returns exactly { roleName, summary, steps, kuniFinalAdvice }", () => {
    const r = buildRoadmap("reconversion", "mobile", "algo");
    expect(Object.keys(r).sort()).toEqual(["kuniFinalAdvice", "roleName", "steps", "summary"]);
    expect(typeof r.summary).toBe("string");
    expect(typeof r.roleName).toBe("string");
    expect(typeof r.kuniFinalAdvice).toBe("string");
    expect(Array.isArray(r.steps)).toBe(true);
  });

  it("is deterministic — identical args produce deeply-equal output", () => {
    const a = buildRoadmap("universidad_inicial", "ia_engineer", "me falta constancia");
    const b = buildRoadmap("universidad_inicial", "ia_engineer", "me falta constancia");
    expect(a).toEqual(b);
  });
});
