import React from "react";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import ServicesSection from "../components/landing/ServicesSection";
import LeadershipSection from "../components/landing/LeadershipSection";
import ContactSection from "../components/landing/ContactSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <LeadershipSection />
      <ContactSection />
    </>
  );
}
