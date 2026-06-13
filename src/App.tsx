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
import ProfileGrader from "./components/ProfileGrader";
import BookingCalendar from "./components/BookingCalendar";
import TestimonialsGuestbook from "./components/TestimonialsGuestbook";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";

export default function App() {
  const [selectedStageOption, setSelectedStageOption] = useState<string | null>(null);
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

        {/* Interactive Career Roadmap Builder powered by Gemini */}
        <RoadmapBuilder stageOverride={selectedStageOption} onScrollTo={handleScrollTo} />

        {/* Interactive LinkedIn / CV Evaluator */}
        <ProfileGrader />

        {/* Testimonials Guestbook forum */}
        <TestimonialsGuestbook />

        {/* Booking slot ticket scheduler */}
        <BookingCalendar bookingFormRef={bookingRef} />

        {/* Accordions FAQ list */}
        <FaqSection />
      </main>

      {/* Styled clean developer footer */}
      <Footer onScrollTo={handleScrollTo} />

    </div>
  );
}
