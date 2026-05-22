import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PriceComparison } from "@/components/pricing-comparison";

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>
        </div>
        <PriceComparison />
      </main>
      <Footer />
    </div>
  );
}
