/**
 * Sample data for the flux bento (app/components/flow-bento.tsx).
 *
 * Everything here is demonstrative: one made-up client, a renovation firm in
 * Bucharest, so the section can show how a period ripples through every number.
 * The page labels it as sample data. The generator is seeded, so the server and
 * the browser build the same numbers and hydration matches.
 */

export type RangeId = "zi" | "saptamana" | "luna" | "an";

export type RangeSpec = {
  id: RangeId;
  /** Tab label. */
  tab: string;
  /** "Vizitatori pe …" */
  unit: string;
  /** The period with its article, for "Treci peste o bară ca să vezi …". */
  the: string;
  /** "apasă ca …", feminine or masculine. */
  pin: string;
};

export const RANGES: readonly RangeSpec[] = [
  { id: "zi", tab: "Zi", unit: "zi", the: "ziua", pin: "s-o fixezi" },
  {
    id: "saptamana",
    tab: "Săptămână",
    unit: "săptămână",
    the: "săptămâna",
    pin: "s-o fixezi",
  },
  { id: "luna", tab: "Lună", unit: "lună", the: "luna", pin: "s-o fixezi" },
  { id: "an", tab: "An", unit: "an", the: "anul", pin: "să-l fixezi" },
];

/** Where visitors arrive from. Google keeps three of its own channels. */
export const SOURCES = [
  { id: "google-search", label: "Google Search", share: 0.31 },
  { id: "google-maps", label: "Google Maps", share: 0.12 },
  { id: "youtube", label: "YouTube", share: 0.07 },
  { id: "facebook", label: "Facebook", share: 0.18 },
  { id: "instagram", label: "Instagram", share: 0.18 },
  { id: "tiktok", label: "TikTok", share: 0.14 },
] as const;

export type SourceId = (typeof SOURCES)[number]["id"];

/** Paid channels. Google gathers Search, Maps and YouTube. `rate` is visitors to clients. */
export const CHANNELS = [
  {
    id: "google",
    label: "Google",
    rate: 0.041,
    from: ["google-search", "google-maps", "youtube"],
  },
  { id: "facebook", label: "Facebook", rate: 0.026, from: ["facebook"] },
  { id: "instagram", label: "Instagram", rate: 0.031, from: ["instagram"] },
  { id: "tiktok", label: "TikTok", rate: 0.022, from: ["tiktok"] },
] as const;

export type ChannelId = (typeof CHANNELS)[number]["id"];

export const PAGES = [
  { path: "/", share: 0.46 },
  { path: "/renovari-apartamente", share: 0.24 },
  { path: "/oferta", share: 0.17 },
  { path: "/contact", share: 0.13 },
] as const;

/** Average value of one won job, in lei. Sample. */
const TICKET = 420;

export type ChannelPoint = {
  id: ChannelId;
  label: string;
  visitors: number;
  clients: number;
  revenue: number;
  rate: number;
};

export type Point = {
  /** Short label for axes and the bar tooltip. */
  label: string;
  /** In a sentence: "pe 8 sep", "în martie". */
  on: string;
  /** "față de 7 sep". */
  vs: string;
  visitors: number;
  /** Cost per enquiry, in lei. */
  cost: number;
  prevCost: number;
  sources: number[];
  channels: ChannelPoint[];
  clients: number;
  pages: number[];
};

const MONTHS = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];
const MONTHS_SHORT = [
  "ian",
  "feb",
  "mar",
  "apr",
  "mai",
  "iun",
  "iul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

type Label = Pick<Point, "label" | "on" | "vs">;

function labelsFor(range: RangeId): Label[] {
  switch (range) {
    case "zi":
      return Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        return {
          label: `${day} sep`,
          on: `pe ${day} sep`,
          vs: day === 1 ? "față de 31 aug" : `față de ${day - 1} sep`,
        };
      });
    case "saptamana":
      return Array.from({ length: 12 }, (_, i) => {
        const week = 27 + i;
        return {
          label: `S${week}`,
          on: `în săptămâna ${week}`,
          vs: `față de săptămâna ${week - 1}`,
        };
      });
    case "luna":
      /* December 2025 to November 2026. */
      return Array.from({ length: 12 }, (_, i) => {
        const month = (11 + i) % 12;
        return {
          label: MONTHS_SHORT[month],
          on: `în ${MONTHS[month]}`,
          vs: `față de ${MONTHS[(month + 11) % 12]}`,
        };
      });
    case "an":
      return Array.from({ length: 5 }, (_, i) => {
        const year = 2022 + i;
        return { label: `${year}`, on: `în ${year}`, vs: `față de ${year - 1}` };
      });
  }
}

/** Visitors grow over the period; the cost of an enquiry falls as the foundation settles. */
const SHAPE: Record<
  RangeId,
  {
    seed: number;
    base: number;
    growth: number;
    noise: number;
    cost: number;
    drop: number;
    costNoise: number;
  }
> = {
  zi: { seed: 8, base: 1450, growth: 0.3, noise: 0.2, cost: 62, drop: 0.38, costNoise: 0.16 },
  saptamana: { seed: 36, base: 10200, growth: 0.35, noise: 0.1, cost: 66, drop: 0.4, costNoise: 0.08 },
  luna: { seed: 12, base: 41000, growth: 0.6, noise: 0.08, cost: 88, drop: 0.5, costNoise: 0.06 },
  an: { seed: 2026, base: 160000, growth: 2.2, noise: 0.05, cost: 140, drop: 0.7, costNoise: 0.04 },
};

/** mulberry32: small, fast and the same on every engine. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function split(total: number, shares: readonly number[], random: () => number) {
  const jittered = shares.map((share) => share * (0.75 + random() * 0.5));
  const sum = jittered.reduce((a, b) => a + b, 0);
  return jittered.map((share) => Math.round((total * share) / sum));
}

function build(range: RangeId): Point[] {
  const shape = SHAPE[range];
  const random = seeded(shape.seed);
  const labels = labelsFor(range);
  const last = labels.length - 1;

  const points = labels.map((label, i) => {
    const t = i / last;
    const visitors = Math.round(
      shape.base * (1 + shape.growth * t) * (1 + shape.noise * (random() * 2 - 1)),
    );
    const costAt = (at: number) =>
      shape.cost * (1 - shape.drop * at) * (1 + shape.costNoise * (random() * 2 - 1));
    const cost = Math.round(costAt(t));
    const sources = split(
      visitors,
      SOURCES.map((source) => source.share),
      random,
    );
    const channels = CHANNELS.map((channel) => {
      const channelVisitors = channel.from.reduce(
        (sum, id) => sum + sources[SOURCES.findIndex((source) => source.id === id)],
        0,
      );
      const clients = Math.max(
        1,
        Math.round(channelVisitors * channel.rate * (0.8 + random() * 0.4)),
      );
      return {
        id: channel.id,
        label: channel.label,
        visitors: channelVisitors,
        clients,
        revenue: Math.round((clients * TICKET * (0.85 + random() * 0.3)) / 10) * 10,
        rate: clients / channelVisitors,
      };
    });
    return {
      ...label,
      visitors,
      cost,
      prevCost: i === 0 ? Math.round(shape.cost * 1.06) : 0,
      sources,
      channels,
      clients: channels.reduce((sum, channel) => sum + channel.clients, 0),
      pages: split(
        visitors,
        PAGES.map((page) => page.share),
        random,
      ),
    };
  });

  /* The period ends on a drop, so the default reading shows what the card promises. */
  if (points[last].cost >= points[last - 1].cost) {
    points[last].cost = Math.round(points[last - 1].cost * 0.86);
  }
  return points.map((point, i) =>
    i === 0 ? point : { ...point, prevCost: points[i - 1].cost },
  );
}

export const SERIES: Record<RangeId, Point[]> = {
  zi: build("zi"),
  saptamana: build("saptamana"),
  luna: build("luna"),
  an: build("an"),
};

/** 1737 as "1.737": Romanian grouping, without depending on the engine's locale data. */
export function formatNumber(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatPercent(ratio: number) {
  return `${(ratio * 100).toFixed(1).replace(".", ",")}%`;
}

/** Romanian counts: "1 client", "7 clienți", "25 de clienți". */
export function count(value: number, one: string, many: string) {
  if (value === 1) return `1 ${one}`;
  const rest = value % 100;
  const de = rest === 0 || rest >= 20 ? "de " : "";
  return `${formatNumber(value)} ${de}${many}`;
}
