import { type SVGProps, useId } from "react";
import type { ChannelId, SourceId } from "@/app/lib/flow-data";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Platform marks, drawn by hand on a 24 grid and kept simple, in the spirit of
 * each brand rather than a copy of its file. They are plain <svg> elements, so
 * they also nest inside a Recharts label at an x/y/width/height.
 */
function Frame({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

/** The G: four arcs of the same ring, then the bar into its mouth. */
function Google(props: IconProps) {
  return (
    <Frame fill="none" strokeWidth={3.2} {...props}>
      <path d="M17.75 7.18A7.5 7.5 0 0 0 4.76 10.06" stroke="#e8401e" />
      <path d="M4.76 10.06a7.5 7.5 0 0 0 1.1 6.24" stroke="#f8d50e" />
      <path d="M5.86 16.3a7.5 7.5 0 0 0 11.89.52" stroke="#53d54b" />
      <path d="M17.75 16.82A7.5 7.5 0 0 0 19.5 12H12" stroke="#4f8df5" />
    </Frame>
  );
}

function GoogleMaps(props: IconProps) {
  return (
    <Frame {...props}>
      <path
        d="M12 2.5a6.6 6.6 0 0 0-6.6 6.6c0 4.9 6.6 12.4 6.6 12.4s6.6-7.5 6.6-12.4A6.6 6.6 0 0 0 12 2.5Z"
        fill="#e8401e"
      />
      <circle cx="12" cy="9.1" r="2.5" fill="#15110d" />
    </Frame>
  );
}

function YouTube(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="2" y="5.5" width="20" height="13" rx="4" fill="#e8401e" />
      <path d="M10 9.1v5.8l5-2.9Z" fill="#f6efdd" />
    </Frame>
  );
}

function Facebook(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="12" cy="12" r="10" fill="#3b7bf0" />
      <path
        d="M13.4 22v-7.2h2.4l.36-2.8H13.4v-1.8c0-.8.23-1.36 1.38-1.36h1.47V6.37a20 20 0 0 0-2.15-.11c-2.13 0-3.58 1.3-3.58 3.68V12H8.1v2.8h2.4V22Z"
        fill="#f6efdd"
      />
    </Frame>
  );
}

/** Instagram's sunset, done in the TV-bar paints of the bento. */
function Instagram(props: IconProps) {
  const id = `ig-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <Frame fill="none" strokeWidth={2} {...props}>
      <defs>
        <linearGradient id={id} x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f8d50e" />
          <stop offset="0.5" stopColor="#e54bc9" />
          <stop offset="1" stopColor="#7d4dfe" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke={`url(#${id})`} />
      <circle cx="12" cy="12" r="3.9" stroke={`url(#${id})`} />
      <circle cx="16.9" cy="7.1" r="1.1" fill="#e54bc9" stroke="none" />
    </Frame>
  );
}

/** The note, with the cyan and red copies a hair off register. */
const NOTE =
  "M16.6 3h-3.1v12.3a2.7 2.7 0 1 1-2.7-2.7c.27 0 .53.04.78.11V9.55a5.8 5.8 0 1 0 5.02 5.75V9.1a7.3 7.3 0 0 0 4.1 1.26V7.27a4.2 4.2 0 0 1-4.1-4.27Z";

function TikTok(props: IconProps) {
  return (
    <Frame {...props}>
      <path d={NOTE} fill="#52cbec" transform="translate(-0.9 -0.7)" />
      <path d={NOTE} fill="#e8401e" transform="translate(0.9 0.7)" />
      <path d={NOTE} fill="#f6efdd" />
    </Frame>
  );
}

const ICONS: Record<SourceId | ChannelId, (props: IconProps) => React.JSX.Element> = {
  google: Google,
  "google-search": Google,
  "google-maps": GoogleMaps,
  youtube: YouTube,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: TikTok,
};

export function ChannelIcon({ id, ...props }: IconProps & { id: SourceId | ChannelId }) {
  const Icon = ICONS[id];
  return <Icon {...props} />;
}
