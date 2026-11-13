"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import { TvScene } from "@/app/components/tv-scene";
import { PAGE_HEX } from "@/app/lib/bars";
import { useSceneStore } from "@/app/lib/scene-store";
import { MOBILE_ASPECT } from "@/app/lib/shots";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** Weak hardware starts in lite mode; the frame-rate monitor can switch it on later. */
function startsLite() {
  const hints = navigator as NavigatorHints;
  return (
    (hints.hardwareConcurrency ?? 8) <= 4 ||
    (hints.deviceMemory ?? 8) <= 3 ||
    hints.connection?.saveData === true
  );
}

/**
 * Fixed WebGL layer behind the page. It takes no pointer events and is hidden
 * from assistive tech. It draws every frame only while a 3D beat is on screen
 * and the tab is visible; under reduced motion it draws single still frames.
 *
 * The layer is 100lvh tall, the viewport with the address bar hidden, and does
 * not follow the window. On a phone the bar slides away on the first swipe; a
 * layer that tracked it would resize the canvas and re-frame the pile mid-scroll.
 */
export default function TvCanvas() {
  const mobile = useSceneStore((state) => state.mobile);
  const active = useSceneStore((state) => state.active);
  const reduced = useSceneStore((state) => state.reduced);
  const lite = useSceneStore((state) => state.lite);
  const ready = useSceneStore((state) => state.ready);

  useLayoutEffect(() => {
    const apply = () => {
      useSceneStore.setState({
        mobile: window.innerWidth / window.innerHeight < MOBILE_ASPECT,
      });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    useSceneStore.setState({ lite: startsLite() });

    /* Run the canvas only while a 3D beat is in view and the tab is in front. */
    const stages = Array.from(document.querySelectorAll("[data-scene-stage]"));
    const inView = new Set<Element>(stages);
    const sync = () => {
      useSceneStore.setState({ active: inView.size > 0 && !document.hidden });
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      sync();
    });
    stages.forEach((stage) => observer.observe(stage));
    document.addEventListener("visibilitychange", sync);

    /* Pointer parallax. Touch screens never fire this with a fine pointer. */
    const fine = window.matchMedia("(pointer: fine)");
    const onMove = (event: PointerEvent) => {
      if (!fine.matches) return;
      const pointer = useSceneStore.getState().pointer;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const frameloop = reduced ? "demand" : active ? "always" : "never";
  const dpr: [number, number] | number = lite ? 1 : mobile ? [1, 1.5] : [1, 2];

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
      data-scene-mode={reduced ? "still" : lite ? "lite" : "full"}
    >
      <Canvas
        flat
        frameloop={frameloop}
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ fov: mobile ? 45 : 35, position: [60, 12, -3], near: 0.3, far: 400 }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.setClearColor(PAGE_HEX, 1);
        }}
      >
        <Suspense fallback={null}>
          <TvScene />
        </Suspense>
        {!reduced && !lite ? (
          <PerformanceMonitor
            bounds={() => [40, 60]}
            flipflops={2}
            onDecline={() => useSceneStore.setState({ lite: true })}
          />
        ) : null}
      </Canvas>
      {/* Film grain and a soft vignette, one static layer over the canvas. The type sits above it, untouched. */}
      <div className="scene-grain absolute inset-0" />
    </div>
  );
}
