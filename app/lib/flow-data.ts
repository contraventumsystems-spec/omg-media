/**
 * Sample data for the flux bento (app/components/flow-bento.tsx).
 *
 * Everything here is demonstrative: one made-up client, a renovation firm in
 * Bucharest, so the section can show how a period ripples through every number.
 * The page labels it as sample data. The generator is seeded, so the server and
 * the browser build the same numbers and hydration matches.
 */

export type RangeId = "zi" | "saptamana" | "luna" | "an";

/** The periods, in tab order. Their names and hints are in the dictionary (services.flow.visitors.ranges). */
export const RANGES: readonly { id: RangeId }[] = [{ id: "zi" }, { id: "saptamana" }, { id: "luna" }, { id: "an" }];

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

/** Entry pages, by share. The sample paths are in the dictionary (services.flow.entry.paths), in this order. */
export const PAGES = [{ share: 0.46 }, { share: 0.24 }, { share: 0.17 }, { share: 0.13 }] as const;

/** Average value of one won job, in lei (euro outside Romanian). Sample. */
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
  /** In a sentence: "pe 8 sep", "în martie", "on Sep 8". */
  on: string;
  /** "față de 7 sep", "vs Sep 7". */
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

/** How a language writes the sample dates. {d} day, {m} short month, {w} week, {month} month, {y} year. */
export type DateWords = {
  months: readonly string[];
  monthsShort: readonly string[];
  day: { label: string; on: string; vs: string };
  week: { label: string; on: string; vs: string };
  month: { on: string; vs: string };
  year: { on: string; vs: string };
};

type Label = Pick<Point, "label" | "on" | "vs">;

const put = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

function labelsFor(range: RangeId, words: DateWords): Label[] {
  switch (range) {
    case "zi":
      /* 1 to 30 September; the first day compares with 31 August. */
      return Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const sep = words.monthsShort[8];
        return {
          label: put(words.day.label, { d: day, m: sep }),
          on: put(words.day.on, { d: day, m: sep }),
          vs: day === 1 ? put(words.day.vs, { d: 31, m: words.monthsShort[7] }) : put(words.day.vs, { d: day - 1, m: sep }),
        };
      });
    case "saptamana":
      return Array.from({ length: 12 }, (_, i) => {
        const week = 27 + i;
        return {
          label: put(words.week.label, { w: week }),
          on: put(words.week.on, { w: week }),
          vs: put(words.week.vs, { w: week - 1 }),
        };
      });
    case "luna":
      /* December 2025 to November 2026. */
      return Array.from({ length: 12 }, (_, i) => {
        const month = (11 + i) % 12;
        return {
          label: words.monthsShort[month],
          on: put(words.month.on, { month: words.months[month] }),
          vs: put(words.month.vs, { month: words.months[(month + 11) % 12] }),
        };
      });
    case "an":
      return Array.from({ length: 5 }, (_, i) => {
        const year = 2022 + i;
        return { label: `${year}`, on: put(words.year.on, { y: year }), vs: put(words.year.vs, { y: year - 1 }) };
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

function build(range: RangeId, words: DateWords): Point[] {
  const shape = SHAPE[range];
  const random = seeded(shape.seed);
  const labels = labelsFor(range, words);
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

/**
 * Every period, with its dates in the reader's language. The numbers are the
 * same in every language: the generator is seeded, so server and browser match.
 */
export function buildSeries(words: DateWords): Record<RangeId, Point[]> {
  return {
    zi: build("zi", words),
    saptamana: build("saptamana", words),
    luna: build("luna", words),
    an: build("an", words),
  };
}
