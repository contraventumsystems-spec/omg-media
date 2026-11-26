/**
 * Captures the project sites for the PROIECTE screens.
 *
 *   node scripts/capture-projects.mjs            all projects
 *   node scripts/capture-projects.mjs prv-atelier-auto
 *
 * Uses the installed Chrome (H.264 video heroes), answers the cookie banner
 * with its most private choice, then scrolls with the wheel one screen at a
 * time and stitches what a visitor sees, so scroll reveals have played.
 *
 * For each site it writes to public/projects/<slug>/:
 *   screen.webp   desktop page, 1024 wide, at most 4096 tall (the TVs scroll it)
 *   phone.webp    phone page, 520 wide, at most 4096 tall (detail page)
 *   cover.webp    first fold, 1200x750 (cards, Open Graph)
 *
 * 4096 is the texture limit every phone GPU supports, so the 3D screen can
 * take the desktop capture as is.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

/**
 * scroll: "wheel" (default) drives smooth-scroll libraries; "jump" sets the
 * scroll position directly, for pages whose pinned sections swallow the wheel.
 * desktopLimit stops the desktop strip early, before a pinned section that
 * would repeat in every frame. hideAfterFirst hides a header the site moves
 * with script, which the fixed/sticky check cannot catch.
 */
const SITES = [
  { slug: "ciprian-ungureanu", url: "https://ciprianungureanu.ro/", scroll: "jump", desktopLimit: 3700 },
  { slug: "saca-experts", url: "https://sacaexperts.ro/" },
  { slug: "sitges-capital", url: "https://www.sitgescasa.es/", scroll: "jump", hideAfterFirst: "header" },
  { slug: "prv-atelier-auto", url: "https://www.prvatelierauto.ro/" },
  { slug: "acoperisuri-nova", url: "https://www.acoperis-nova.ro/" },
  { slug: "dupa-apa-la-razvan", url: "https://dupaapalarazvan.ro/" },
];

const MAX_TEXTURE = 4096;
const OUT = path.resolve("public/projects");

/** Answers the consent banner with the most private choice it offers. */
async function declineConsent(page) {
  const reject = /^(refuz|refuză|respinge|respinge tot|doar (cele )?necesare|necesare|reject( all)?|decline|only necessary|necessary only|rechazar( todo)?|solo necesarias|respinge op[țt]ionale|refuz[ăa]? op[țt]ionale|reject optional|only essential|doar esen[țt]iale|essential only|deny optional|deny|reject non-essential)$/i;
  for (const button of await page.locator("button, a[role=button], [role=button]").all()) {
    const text = ((await button.innerText().catch(() => "")) || "").trim();
    if (reject.test(text) && (await button.isVisible().catch(() => false))) {
      await button.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(500);
      return;
    }
  }
}

/** Removes what floats over the page: banners, chat bubbles, modal backdrops. The top header stays for the first frame. */
async function stripFloating(page, keepHeader) {
  await page.evaluate((keep) => {
    for (const element of document.querySelectorAll("body *")) {
      const style = getComputedStyle(element);
      if (style.position !== "fixed" && style.position !== "sticky") continue;
      const box = element.getBoundingClientRect();
      /* Large fixed layers are page backgrounds or smooth-scroll wrappers, not overlays. */
      if (box.width * box.height > window.innerWidth * window.innerHeight * 0.4) continue;
      const isHeader = box.top <= 24 && box.height < 160 && box.width > window.innerWidth * 0.6;
      if (isHeader && keep) continue;
      element.style.setProperty("opacity", "0", "important");
    }
  }, keepHeader);
}

/**
 * Scrolls one screen at a time and stitches what the visitor sees, so scroll
 * reveals have played. Stops once the strip would pass the texture limit.
 */
async function strip(page, cssLimit, width, mode, hideAfterFirst) {
  const { innerHeight: step, total } = await page.evaluate(() => ({
    innerHeight: window.innerHeight,
    total: document.documentElement.scrollHeight,
  }));
  const end = Math.min(total, cssLimit);
  const frames = [];
  /* The wheel, not scrollTo: smooth-scroll libraries only follow real input. */
  await page.mouse.move(width / 2, step / 2);
  let previous = -1;
  for (let y = 0; y < end; y += step) {
    if (y > 0 && mode === "wheel") await page.mouse.wheel(0, step);
    if (mode === "jump") await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(1100);
    const actual = await page.evaluate(() => window.scrollY);
    if (mode === "wheel" && actual === previous) break;
    previous = actual;
    await stripFloating(page, y === 0);
    if (y > 0 && hideAfterFirst) {
      await page.addStyleTag({ content: `${hideAfterFirst} { opacity: 0 !important; }` });
    }
    frames.push({ top: actual, png: await page.screenshot({ type: "png" }) });
  }
  return { frames, height: end };
}

async function shoot(browser, site, { width, height, scale, outWidth, file }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    isMobile: width < 600,
    hasTouch: width < 600,
    locale: "ro-RO",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto(site.url, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await declineConsent(page);
  await page.addStyleTag({ content: "html, body { scroll-behavior: auto !important; }" });
  const textureLimit = Math.floor((MAX_TEXTURE / outWidth) * width);
  const cssLimit = width > 600 && site.desktopLimit ? Math.min(site.desktopLimit, textureLimit) : textureLimit;
  const { frames, height: total } = await strip(page, cssLimit, width, site.scroll ?? "wheel", site.hideAfterFirst);
  await context.close();

  const fullWidth = width * scale;
  const fullHeight = total * scale;
  const canvas = sharp({
    create: { width: fullWidth, height: fullHeight, channels: 3, background: "#ffffff" },
  }).composite(
    frames
      .filter((frame) => frame.top * scale < fullHeight)
      .map((frame) => ({ input: frame.png, left: 0, top: frame.top * scale })),
  );
  const stitched = await canvas.png().toBuffer();
  const cropped = await sharp(stitched)
    .extract({ left: 0, top: 0, width: fullWidth, height: fullHeight })
    .png()
    .toBuffer();
  await sharp(cropped)
    .resize({ width: outWidth })
    .webp({ quality: 72, effort: 6 })
    .toFile(path.join(OUT, site.slug, file));
  return cropped;
}

async function capture(browser, site) {
  await mkdir(path.join(OUT, site.slug), { recursive: true });
  const desktop = await shoot(browser, site, {
    width: 1440,
    height: 900,
    scale: 1,
    outWidth: 1024,
    file: "screen.webp",
  });
  await sharp(desktop)
    .extract({ left: 0, top: 0, width: 1440, height: 900 })
    .resize({ width: 1200, height: 750, fit: "cover", position: "top" })
    .webp({ quality: 78, effort: 6 })
    .toFile(path.join(OUT, site.slug, "cover.webp"));
  await shoot(browser, site, {
    width: 390,
    height: 844,
    scale: 2,
    outWidth: 520,
    file: "phone.webp",
  });
  console.log(`ok  ${site.slug}`);
}

const only = process.argv[2];
/* Installed Chrome, not the bundled Chromium: it plays H.264, so video heroes render. */
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
for (const site of SITES.filter((entry) => !only || entry.slug === only)) {
  try {
    await capture(browser, site);
  } catch (error) {
    console.error(`err ${site.slug}: ${error.message}`);
  }
}
await browser.close();
