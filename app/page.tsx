import { AudienceBento } from "@/app/components/audience-bento";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { CreativeBento } from "@/app/components/creative-bento";
import { FlowBento } from "@/app/components/flow-bento";
import { PillarCabinet } from "@/app/components/pillar-cabinet";
import { ProcessJourney } from "@/app/components/process-journey";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { FaqBoard } from "@/app/components/faq-board";
import { Hero } from "@/app/components/hero";
import { OutroFlux } from "@/app/components/outro-flux";
import { ProofBridge } from "@/app/components/proof-bridge";
import {
  Services,
  Work,
} from "@/app/components/home-sections";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { TvBackdrop } from "@/app/components/tv-backdrop";

/**
 * Homepage only. The TV sits behind the hero; each section after it is solid.
 *
 * Story order: what we do (hero, the three pillars, the work beat as a visual
 * pause), who it is for, how we work (the six steps, then the drawers), proof
 * (the charts, then the content), why you can rely on us, questions, contact.
 * Hero, Services and Work are one 3D camera move on the fixed canvas, so they
 * stay together and in this order.
 */
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

          <AudienceBento />
          <ProcessJourney />
          <PillarCabinet />
          <FlowBento />
          <ProofBridge />
          <CreativeBento />
          <OutroFlux />
          <FaqBoard />
          <Closing />
        </main>
        <Footer />
      </div>
      <StickyWhatsApp />
      <ChannelChange />
    </>
  );
}
