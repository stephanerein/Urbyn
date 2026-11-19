import { Minus, Plus } from 'lucide-react';

/**
 * Section repliée par défaut : le « + » à côté du titre l'ouvre.
 *
 * Le contenu reste dans le HTML de la page (balise details) : il est lu par les
 * moteurs de recherche et les assistants même quand la section est fermée.
 */
export function SectionDepliable({
  id,
  titre,
  children,
}: {
  /** Identifiant du titre, utilisé aussi pour les liens d'ancrage. */
  id: string;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group mt-14 border-t border-slate-200 pt-6">
      <summary className="flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-black"
        >
          <Plus className="h-5 w-5 group-open:hidden" />
          <Minus className="hidden h-5 w-5 group-open:block" />
        </span>
        <h2 id={id} className="text-2xl font-bold text-black">
          {titre}
        </h2>
      </summary>
      <div className="mt-6">{children}</div>
    </details>
  );
}
