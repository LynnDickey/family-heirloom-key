import { Card } from "@/components/ui/card";
import { Lock, Clock, Shield, Key, FileText, Wallet } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Military-grade encryption ensures your family's financial data remains completely private and secure.",
  },
  {
    icon: Clock,
    title: "Time-Based Unlocking",
    description: "Set specific dates or conditions that must be met before funds become accessible to beneficiaries.",
  },
  {
    icon: Shield,
    title: "Multi-Signature Security",
    description: "Require multiple family members to approve major decisions, preventing unauthorized access.",
  },
  {
    icon: Key,
    title: "Decryption Keys",
    description: "Each generation holds unique keys that only work when predefined conditions are satisfied.",
  },
  {
    icon: FileText,
    title: "Smart Contracts",
    description: "Automated execution of your wishes through blockchain-based contracts that can't be altered.",
  },
  {
    icon: Wallet,
    title: "Wallet Integration",
    description: "Seamlessly connect with Rainbow Wallet for secure transaction signing and fund management.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-vault-dark/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Vault-Grade{" "}
            <span className="bg-gradient-to-r from-primary to-legacy-gold bg-clip-text text-transparent">
              Security
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-level protection for your family's most important asset: their future
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
