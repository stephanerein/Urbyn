import { Helmet } from 'react-helmet-async';

// En environnement Figma Make, le document.head est sandboxé — on désactive silencieusement.
const IS_FIGMA = typeof window !== 'undefined' && window.location.hostname.includes('figma');

const SITE_NAME = 'Urbyn by Atelier Urbanize';
const BASE_URL = 'https://plateform.urbanize.site';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  jsonLd?: object | object[];
}

export function SEOMeta({
  title,
  description = 'Configurez et commandez vos totems, palissades et massifs béton en ligne. Mobilier urbain temporaire pour chantiers et événements — livraison partout en Europe.',
  keywords,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  jsonLd,
}: SEOMetaProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  const schemas = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : [];

  if (IS_FIGMA) return null;

  return (
    <Helmet>
      {/* Basics */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

// ── Schémas JSON-LD réutilisables ─────────────────────────────────────────────

export const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Urbyn by Atelier Urbanize',
  url: 'https://www.urbanize.site',
  logo: 'https://plateform.urbanize.site/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@urbanize.site',
    contactType: 'customer service',
    availableLanguage: ['French'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'FR',
  },
  sameAs: ['https://www.urbanize.site'],
  description: 'Fabricant et loueur de mobilier urbain temporaire : totems, palissades, massifs béton pour chantiers et événements.',
};

export function productSchema(opts: {
  name: string;
  description: string;
  sku?: string;
  price?: number;
  currency?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    ...(opts.sku ? { sku: opts.sku } : {}),
    ...(opts.image ? { image: opts.image } : {}),
    url: `https://plateform.urbanize.site${opts.url}`,
    brand: { '@type': 'Brand', name: 'Urbyn by Atelier Urbanize' },
    ...(opts.price != null
      ? {
          offers: {
            '@type': 'Offer',
            price: opts.price,
            priceCurrency: opts.currency ?? 'EUR',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Urbyn by Atelier Urbanize' },
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://plateform.urbanize.site${item.url}`,
    })),
  };
}
