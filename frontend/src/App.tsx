import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
// import AboutPage, ServicesPage, ContactPage, etc. as you build them!
function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          {/* <Route path="/services" element={<ServicesPage />} /> */}
          {/* <Route path="/contact" element={<ContactPage />} /> */}
        </Routes>
      </main>
      <Footer />
    </>
  );
}
export default App;
