import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import ProductSection from "@/components/ProductSection";
import FormSection from "@/components/FormSection";
import NavigationBar from "@/components/NavigationBar";
import DistractingElements from "@/components/DistractingElements";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DistractingElements />
      <NavigationBar activeSection={activeSection} setActiveSection={setActiveSection} />
      <HeroSection />
      <ProductSection />
      <FormSection />
    </div>
  );
};

export default Index;
