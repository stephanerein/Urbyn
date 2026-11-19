import { Check } from 'lucide-react';

/** Carte cochable : Mise en place et options partagent la même présentation. */
export function CarteChoix({
  coche,
  onChange,
  titre,
  etiquette,
  className = '',
  children,
}: {
  coche: boolean;
  onChange: (coche: boolean) => void;
  titre: string;
  /** Solution concernée, affichée en pastille. */
  etiquette?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={coche}
      onClick={() => onChange(!coche)}
      className={`w-full text-left rounded-xl border-2 p-6 transition-all ${
        coche ? 'border-black bg-slate-50 shadow-md' : 'border-slate-200 hover:border-black'
      } ${className}`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
            coche ? 'border-black bg-black' : 'border-slate-300 bg-white'
          }`}
        >
          {coche && <Check className="h-4 w-4 text-white" />}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-black">{titre}</h2>
            {etiquette && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-800">
                {etiquette}
              </span>
            )}
          </div>
          {children}
        </div>
      </div>
    </button>
  );
}
