import HeroSection from "../components/sections/HeroSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import CtaSection from "../components/sections/CtaSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CtaSection />
      <HowItWorksSection />
      <FeaturesSection />
    </>
  );
}