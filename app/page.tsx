"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProviderList } from "@/components/provider-list";
import { LotterySection } from "@/components/lottery-section";
import { TrialSection } from "@/components/trial-section";
import { Footer } from "@/components/footer";
import { AnnouncementBanner } from "@/components/announcement";
import { AdBanner } from "@/components/ad-banner";

export default function Home() {
  const [hasAds, setHasAds] = useState(false);

  return (
    <div className="min-h-screen">
      <AdBanner onHasAds={setHasAds} />
      {!hasAds && <AnnouncementBanner />}
      <Header />
      <main>
        <Hero />
        <TrialSection />
        <LotterySection />
        <ProviderList />
      </main>
      <Footer />
    </div>
  );
}
