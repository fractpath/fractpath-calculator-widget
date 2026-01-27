import { createRoot, type Root } from "react-dom/client";
import App from "./App";

type Persona = "Buyer" | "Homeowner" | "Realtor";

let root: Root | null = null;
let currentPersona: Persona = "Buyer";

/**
 * Mounts the calculator into a DOM element.
 * Safe to call multiple times; it will reuse the same React root.
 */
export function mount(el: HTMLElement) {
  try {
    if (!el) return;

    // Create root once
    if (!root) {
      root = createRoot(el);
    }

    root.render(<App key={currentPersona} initialPersona={currentPersona} />);

  } catch (err) {
    // Fail gracefully: if React fails, show a fallback message
    console.error("[FractPathCalculator] mount failed:", err);
    el.innerHTML =
      "The scenario tool is temporarily unavailable. Please request a manual scenario review.";
  }
}

/**
 * Sets the persona (called from Webflow). Will re-render if mounted.
 */
export function setPersona(persona: Persona) {
  currentPersona = persona;
  const mountEl = document.getElementById("fractpath-calculator");
  if (mountEl) mount(mountEl);
}

/**
 * Resets the scenario state (placeholder for later).
 */
export function resetScenario() {
  // We'll implement later once calculator state exists
  const mountEl = document.getElementById("fractpath-calculator");
  if (mountEl) mount(mountEl);
}

/**
 * Auto-mount on DOM ready (safe no-op if element not found).
 */
function autoMountWhenReady() {
  const mountEl = document.getElementById("fractpath-calculator");
  if (!mountEl) return; // no-op if not on a page with the widget

  mount(mountEl);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMountWhenReady);
} else {
  autoMountWhenReady();
}

// Expose a minimal global API for Webflow scripts to call.
declare global {
  interface Window {
    FractPathCalculator?: {
      mount: (el: HTMLElement) => void;
      setPersona: (persona: Persona) => void;
      resetScenario: () => void;
    };
  }
}

window.FractPathCalculator = {
  mount,
  setPersona,
  resetScenario,
};
