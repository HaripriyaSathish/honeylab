"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useState } from "react";
import BeeFlight2D from "./BeeFlight2D";

// 3D bee loads only in the browser
const BeeFlight = dynamic(() => import("./BeeFlight"), { ssr: false });

// Can this browser draw 3D (WebGL)? Not when graphics/hardware acceleration is turned off.
function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { alpha: true }) ||
      canvas.getContext("webgl", { alpha: true }) ||
      canvas.getContext("experimental-webgl");
    if (!gl || gl.isContextLost()) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // free the test context
    return true;
  } catch {
    return false;
  }
}

// If the 3D scene crashes anyway, switch to the 2D bee instead of breaking the page
class BeeErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.warn("Honey Lab: 3D bee failed, using 2D bee —", err?.message);
  }
  render() {
    return this.state.failed ? <BeeFlight2D /> : this.props.children;
  }
}

export default function BeeFlightLoader() {
  const [mode, setMode] = useState(null); // "3d" | "2d"

  useEffect(() => {
    // add ?bee=2d to the URL to force the 2D bee (handy for testing)
    const force2D = new URLSearchParams(window.location.search).get("bee") === "2d";
    const ok = !force2D && hasWebGL();
    setMode(ok ? "3d" : "2d");
    if (!ok && !force2D) {
      console.info(
        "Honey Lab: 3D is not available in this browser, showing the 2D bee. " +
          "For the realistic 3D bee, turn on 'Use graphics acceleration when available' and restart the browser."
      );
    }
  }, []);

  if (!mode) return null;
  if (mode === "2d") return <BeeFlight2D />;
  return (
    <BeeErrorBoundary>
      <BeeFlight />
    </BeeErrorBoundary>
  );
}
