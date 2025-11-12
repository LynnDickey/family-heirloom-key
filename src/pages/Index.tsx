import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import GenerationalTiers from "@/components/GenerationalTiers";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <GenerationalTiers />
      <Footer />
    </div>
  );
};

export default Index;
