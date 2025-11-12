import { Button } from "@/components/ui/button";
import { Shield, Lock, Users } from "lucide-react";
import heroVault from "@/assets/hero-vault.png";
import CreateVaultDialog from "@/components/CreateVaultDialog";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--vault-glow)/0.15),transparent_70%)]" />
      
      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Secure Multi-Generational Fund Management</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Plan Ahead,{" "}
              <span className="bg-gradient-to-r from-primary via-tier-secondary to-legacy-gold bg-clip-text text-transparent">
                Securely
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl">
              Manage encrypted fund allocations across generations. Your family's financial future, 
              protected by blockchain technology and unlocked only when conditions are met.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <CreateVaultDialog>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-[0_0_30px_hsl(var(--vault-glow)/0.4)] hover:shadow-[0_0_40px_hsl(var(--vault-glow)/0.6)] transition-all"
                >
                  <Lock className="h-5 w-5" />
                  Create Your Vault
                </Button>
              </CreateVaultDialog>
              <Button 
                size="lg" 
                variant="outline"
                className="border-border hover:bg-secondary"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Encrypted</div>
                  <div className="text-xs text-muted-foreground">End-to-end</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Multi-Gen</div>
                  <div className="text-xs text-muted-foreground">Family tiers</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-tier-secondary/20 blur-3xl" />
            <img 
              src={heroVault} 
              alt="Digital Vault Interface" 
              className="relative rounded-2xl border border-primary/20 shadow-[0_0_50px_hsl(var(--vault-glow)/0.3)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
