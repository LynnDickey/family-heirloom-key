import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="LegacyFund Logo" className="h-10 w-10" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-tier-secondary bg-clip-text text-transparent">
            LegacyFund
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#tiers" className="text-foreground/80 hover:text-foreground transition-colors">
            Tiers
          </a>
          <a href="#security" className="text-foreground/80 hover:text-foreground transition-colors">
            Security
          </a>
        </nav>
        
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-[0_0_20px_hsl(var(--vault-glow)/0.3)]">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </header>
  );
};

export default Header;
