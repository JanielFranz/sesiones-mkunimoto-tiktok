/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BentoStats from "./components/BentoStats";
import WhoIsItFor from "./components/WhoIsItFor";
import WhatYouGet from "./components/WhatYouGet";
import RoadmapBuilder from "./components/RoadmapBuilder";
import BookingCalendar from "./components/BookingCalendar";
import TestimonialsGuestbook from "./components/TestimonialsGuestbook";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import TermsAndConditions from "./components/TermsAndConditions";

export default function App() {
  const [selectedStageOption, setSelectedStageOption] = useState<string | null>(null);
  // Vista actual: el landing ("home") o la página legal ("terms").
  // No usamos router; alternamos con estado y volvemos con el botón "Volver al inicio".
  const [view, setView] = useState<"home" | "terms">("home");
  const bookingRef = useRef<HTMLDivElement>(null);

  const handleScrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenBooking = () => {
    if (bookingRef.current) {
      bookingRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleStageSelectFromAudience = (stageKey: string) => {
    setSelectedStageOption(stageKey);
  };

  // Desde la página legal, volver al home y llevar directo al formulario de reserva.
  const handleBookFromTerms = () => {
    setView("home");
    requestAnimationFrame(handleOpenBooking);
  };

  if (view === "terms") {
    return <TermsAndConditions onBack={() => setView("home")} onOpenBooking={handleBookFromTerms} />;
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col justify-between selection:bg-yellow-300 selection:text-black">
      
      {/* Upper Navigation Bar */}
      <Header onScrollTo={handleScrollTo} onOpenBooking={handleOpenBooking} />

      <main className="flex-grow">
        {/* Hero Presentation */}
        <Hero onScrollTo={handleScrollTo} onOpenBooking={handleOpenBooking} />

        {/* Dynamic Bento stats indicators */}
        <BentoStats />

        {/* Who is it for target segment cards */}
        <WhoIsItFor onSelectStage={handleStageSelectFromAudience} />

        {/* Interactive Workshop Showcase info list */}
        <WhatYouGet />

        {/* Interactive Career Roadmap Builder (deterministic, curated by Kuni) */}
        <RoadmapBuilder stageOverride={selectedStageOption} onScrollTo={handleScrollTo} />

        {/* Testimonials showcase */}
        <TestimonialsGuestbook />

        {/* Booking slot ticket scheduler */}
        <BookingCalendar bookingFormRef={bookingRef} />

        {/* Accordions FAQ list */}
        <FaqSection />
      </main>

      {/* Styled clean developer footer */}
      <Footer onScrollTo={handleScrollTo} onOpenTerms={() => setView("terms")} />

    </div>
  );
}
