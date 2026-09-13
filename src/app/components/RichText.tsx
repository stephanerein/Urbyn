import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Rendu d'un texte pouvant contenir des liens au format markdown
// `[libellé](url)`.
//
// Les URL commençant par « / » deviennent des liens internes (navigation React
// Router, sans rechargement de page) ; les autres des liens externes ouverts
// dans un nouvel onglet.
//
// Volontairement limité aux liens : le texte reste du texte et n'est jamais
// injecté en HTML (pas de dangerouslySetInnerHTML), il n'y a donc aucun risque
// d'injection si un jour ces contenus viennent d'ailleurs que du code.
// ─────────────────────────────────────────────────────────────────────────────

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

const linkClass =
  'font-bold underline underline-offset-4 decoration-2 hover:text-gray-600 transition-colors';

/**
 * Rend un texte en plusieurs paragraphes : les blocs séparés par une ligne
 * vide deviennent autant de `<p>`, liens compris. Un texte sans ligne vide
 * produit simplement un seul paragraphe.
 */
export function RichParagraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={className}>
          <RichText text={paragraph} />
        </p>
      ))}
    </>
  );
}

/**
 * Retire le balisage des liens pour obtenir le texte brut — utile là où le
 * markup n'a pas de sens (meta description, attribut alt…).
 */
export function stripLinks(text: string): string {
  return text.replace(new RegExp(LINK_PATTERN.source, 'g'), '$1');
}

export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  // Instance locale : une regex globale conserve un état (lastIndex) qu'il ne
  // faut pas partager entre deux rendus.
  const pattern = new RegExp(LINK_PATTERN.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const [full, label, href] = match;

    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    nodes.push(
      href.startsWith('/') ? (
        <Link to={href} className={linkClass}>
          {label}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>
      ),
    );

    cursor = match.index + full.length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}
