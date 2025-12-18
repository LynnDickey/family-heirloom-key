import Header from "@/components/Header";
import BalanceVerifier from "@/components/BalanceVerifier";
import Footer from "@/components/Footer";
import { Shield, Lock, Key, Sparkles, Zap, Eye, EyeOff } from "lucide-react";

// Decorative floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
};

// Decorative grid background
const GridBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

// Decorative feature card (non-functional)
const DecorativeFeature = ({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay: string;
}) => {
  return (
    <div 
      className={`glass-effect rounded-xl p-6 card-hover-effect opacity-0 animate-fade-in-up ${delay}`}
    >
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 animate-bounce-subtle">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

// Decorative stats section (non-functional)
const DecorativeStats = () => {
  const stats = [
    { value: "256-bit", label: "Encryption" },
    { value: "100%", label: "Privacy" },
    { value: "FHE", label: "Technology" },
    { value: "∞", label: "Security" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-12">
      {stats.map((stat, index) => (
        <div 
          key={stat.label}
          className={`text-center p-6 glass-effect rounded-xl opacity-0 animate-scale-in animate-delay-${(index + 1) * 100}`}
        >
          <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

// Decorative security badges (non-functional)
const SecurityBadges = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 my-8">
      {[
        { icon: Shield, text: "Zero Knowledge" },
        { icon: Lock, text: "End-to-End Encrypted" },
        { icon: Eye, text: "Privacy First" },
      ].map((badge, index) => (
        <div 
          key={badge.text}
          className={`flex items-center gap-2 px-4 py-2 glass-effect rounded-full text-sm opacity-0 animate-slide-in-left animate-delay-${(index + 1) * 100}`}
        >
          <badge.icon className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{badge.text}</span>
        </div>
      ))}
    </div>
  );
};

// Decorative glow orbs
const GlowOrbs = () => {
  return (
    <>
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-tier-secondary/20 rounded-full blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
    </>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <GridBackground />
      <FloatingParticles />
      <GlowOrbs />
      
      <Header />
      
      <main className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section with animations */}
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full mb-6 animate-bounce-subtle">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Powered by Fully Homomorphic Encryption</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="block opacity-0 animate-fade-in-up">Encrypted Balance</span>
            <span className="block gradient-text opacity-0 animate-fade-in-up animate-delay-200">Verifier</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-up animate-delay-300">
            Verify spending amounts against your encrypted balance without revealing actual values.
            Perfect for DAOs, wallets, and children's financial wallets.
          </p>
        </div>

        {/* Security Badges */}
        <SecurityBadges />

        {/* Main Verifier Component */}
        <div className="opacity-0 animate-scale-in animate-delay-400">
          <BalanceVerifier />
        </div>

        {/* Decorative Stats */}
        <DecorativeStats />

        {/* Decorative Features Grid */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 opacity-0 animate-fade-in animate-delay-300">
            <span className="gradient-text">Why Choose FHE?</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <DecorativeFeature
              icon={EyeOff}
              title="Complete Privacy"
              description="Your balance remains encrypted at all times. Even during verification, actual values are never exposed."
              delay="animate-delay-100"
            />
            <DecorativeFeature
              icon={Zap}
              title="Instant Verification"
              description="Get immediate results on spending eligibility without compromising your financial privacy."
              delay="animate-delay-200"
            />
            <DecorativeFeature
              icon={Key}
              title="Your Keys, Your Data"
              description="Only you control access to your encrypted balance. No third party can decrypt your information."
              delay="animate-delay-300"
            />
          </div>
        </div>

        {/* Decorative divider */}
        <div className="my-16 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="h-8 w-8 rounded-full glass-effect flex items-center justify-center animate-rotate-slow">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* How it works section (decorative) */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-8 opacity-0 animate-fade-in">
            <span className="gradient-text">How It Works</span>
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {[
              { step: "1", title: "Set Balance", desc: "Encrypt your balance on-chain" },
              { step: "2", title: "Enter Amount", desc: "Specify spending to verify" },
              { step: "3", title: "Get Result", desc: "Receive encrypted verification" },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className={`flex flex-col items-center opacity-0 animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
                  <div className="h-12 w-12 rounded-full border-gradient flex items-center justify-center text-xl font-bold text-primary mb-2">
                    {item.step}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block h-px w-16 bg-gradient-to-r from-primary to-tier-secondary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
