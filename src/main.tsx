
  import { createRoot, hydrateRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  const container = document.getElementById("root")!;

  // Prerendered pages ship real markup inside #root (see prerender.mjs) — hydrate
  // it instead of re-rendering from scratch. Routes that weren't prerendered
  // still get plain client-side rendering, same as before. Check .children
  // (elements only), not .hasChildNodes() — the dev/unprerendered index.html
  // leaves an "<!--app-html-->" comment placeholder inside #root, which counts
  // as a child node but not as an element, so it must not trigger hydration.
  if (container.children.length > 0) {
    hydrateRoot(container, <App />);
  } else {
    createRoot(container).render(<App />);
  }
