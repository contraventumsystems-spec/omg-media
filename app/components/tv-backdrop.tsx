"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { useSceneStore } from "@/app/lib/scene-store";

/**
 * The canvas chunk stays off the server and loads after hydration.
 * Reduced motion still gets the pile, as one still frame of the finished scene.
 * Missing WebGL leaves the dark page background in place, since there is no poster yet.
 */
const TvCanvas = dynamic(() => import("@/app/components/tv-canvas"), {
  ssr: false,
});

let webgl: boolean | null = null;

/** Probed once in the browser. The server snapshot is false, so nothing mounts before hydration. */
function hasWebGL() {
  if (webgl === null) {
    try {
      webgl = Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const never = () => () => {};

export function TvBackdrop() {
  const enabled = useSyncExternalStore(never, hasWebGL, () => false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => useSceneStore.setState({ reduced: query.matches });
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  if (!enabled) return null;
  return <TvCanvas />;
}
