import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProviderList } from "@/components/provider-list";
import { LotterySection } from "@/components/lottery-section";
import { Footer } from "@/components/footer";
import { AnnouncementBanner } from "@/components/announcement";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AnnouncementBanner />
      <Header />
      <main>
        <Hero />
        <LotterySection />
        <ProviderList />
      </main>
      <Footer />
    </div>
  );
}
