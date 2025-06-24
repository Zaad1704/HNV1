// frontend/src/components/landing/HeroSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const { data: settings } = useSiteSettings();
  const { t } = useTranslation();

  return (
    <section
      id="hero"
      className="text-white py-20 md:py-32"
      style={{
        // Adjusted linear gradient to new dark theme colors
        backgroundImage: `linear-gradient(to right, rgba(33, 42, 49, 0.7), rgba(18, 78, 102, 0.6)), url('${
          settings?.heroSection?.backgroundImageUrl || "https://placehold.co/1600x900"
        }')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {t("hero.title")}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
          {t("hero.subtitle")}
        </p>
        <Link
          to="/register"
          className="bg-brand-primary hover:bg-brand-accent-dark text-dark-text font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105" // Updated button colors
        >
          {t("hero.cta")}
        </Link>
      </div>
    </section>
  );
}
