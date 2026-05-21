import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PriceComparison } from "@/components/pricing-comparison";

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PriceComparison />
      </main>
      <Footer />
    </div>
  );
}
