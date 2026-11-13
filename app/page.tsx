import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { Hero } from "@/app/components/hero";
import {
  AiSystem,
  Faq,
  Fit,
  Process,
  Services,
  Work,
} from "@/app/components/home-sections";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { TvBackdrop } from "@/app/components/tv-backdrop";

/** Homepage only. The TV sits behind the hero; every later section is solid. */
export default function Home() {
  return (
    <>
      <TvBackdrop />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Services />
          <Work />
          <Process />
          <AiSystem />
          <Fit />
          <Faq />
          <Closing />
        </main>
        <Footer />
      </div>
      <StickyWhatsApp />
      <ChannelChange />
    </>
  );
}
