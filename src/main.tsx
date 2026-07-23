
  import { createRoot, hydrateRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  const container = document.getElementById("root")!;

  // Prerendered pages ship real markup inside #root (see prerender.mjs) — hydrate
  // it instead of re-rendering from scratch. Routes that weren't prerendered
  // still get plain client-side rendering, same as before.
  if (container.hasChildNodes()) {
    hydrateRoot(container, <App />);
  } else {
    createRoot(container).render(<App />);
  }
