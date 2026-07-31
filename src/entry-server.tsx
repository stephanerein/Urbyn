import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import type { HelmetServerState } from 'react-helmet-async';
import { AppShell } from './app/App';

// Called by prerender.mjs (Node, build time) for each indexable route.
// Renders the app tree for that exact URL and returns both the markup and the
// SEOMeta/react-helmet-async output for that page, so the script can inject
// real per-page <title>/<meta>/JSON-LD into the static HTML shipped to crawlers.
export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <StaticRouter location={url}>
      <AppShell helmetContext={helmetContext} />
    </StaticRouter>,
  );

  return { html, helmet: helmetContext.helmet };
}
