import { Card } from "@/components/ui/card";
import { User, Users, Baby } from "lucide-react";

const tiers = [
  {
    icon: User,
    name: "Generation 1",
    description: "Primary account holders with full control",
    color: "tier-primary",
    funds: "100%",
  },
  {
    icon: Users,
    name: "Generation 2",
    description: "Children with conditional access",
    color: "tier-secondary",
    funds: "75%",
  },
  {
    icon: Baby,
    name: "Generation 3",
    description: "Grandchildren with time-locked access",
    color: "tier-tertiary",
    funds: "50%",
  },
];

const GenerationalTiers = () => {
  return (
    <section id="tiers" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--tier-secondary)/0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Generational{" "}
            <span className="bg-gradient-to-r from-tier-primary to-tier-tertiary bg-clip-text text-transparent">
              Tiers
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Structure your family's funds across multiple generations with intelligent unlock conditions
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={index}
                className="relative group p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${tier.color}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="relative z-10 space-y-6">
                  <div className={`h-16 w-16 rounded-2xl bg-${tier.color}/10 flex items-center justify-center`}>
                    <Icon className={`h-8 w-8 text-${tier.color}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-muted-foreground">{tier.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <div className="text-sm text-muted-foreground mb-1">Available Allocation</div>
                    <div className={`text-3xl font-bold text-${tier.color}`}>{tier.funds}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GenerationalTiers;
