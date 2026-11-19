import { AudienceBento } from "@/app/components/audience-bento";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { CreativeBento } from "@/app/components/creative-bento";
import { FlowBento } from "@/app/components/flow-bento";
import { PillarCabinet } from "@/app/components/pillar-cabinet";
import { ProcessJourney } from "@/app/components/process-journey";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { Hero } from "@/app/components/hero";
import { OutroFlux } from "@/app/components/outro-flux";
import {
  AiSystem,
  Faq,
  Services,
  Work,
} from "@/app/components/home-sections";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { TvBackdrop } from "@/app/components/tv-backdrop";

/** Homepage only. The TV sits behind the hero; each section after it is solid. */
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
          <FlowBento />
          <AiSystem />
          <CreativeBento />
          <ProcessJourney />
          <PillarCabinet />
          <AudienceBento />
          <OutroFlux />
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
