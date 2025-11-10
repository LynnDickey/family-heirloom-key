import Header from "@/components/Header";
import BalanceVerifier from "@/components/BalanceVerifier";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Encrypted Balance Verifier
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify spending amounts against your encrypted balance without revealing actual values.
            Perfect for DAOs, wallets, and children's financial wallets.
          </p>
        </div>
        <BalanceVerifier />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
