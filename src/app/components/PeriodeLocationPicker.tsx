import { format, isBefore, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { Link } from 'react-router-dom';
import { Truck, PackageOpen, Info } from 'lucide-react';
import { Calendar } from './ui/calendar';
import {
  CRENEAUX,
  DELAI_MINIMAL_JOURS,
  delaiTropCourt,
  dureeEnJours,
  type Creneau,
  type PeriodeLocation,
} from '../lib/periodeLocation';

// Calendrier de choix de la période de location : un premier clic fixe la date
// de livraison souhaitée, un second la date d'enlèvement.

function jour(date?: Date): string {
  return date ? format(date, 'EEEE d MMMM yyyy', { locale: fr }) : 'À choisir';
}

function ChoixCreneau({
  legende,
  valeur,
  onChange,
}: {
  legende: string;
  valeur?: Creneau;
  onChange: (creneau?: Creneau) => void;
}) {
  const options: Array<{ id?: Creneau; libelle: string; plage?: string }> = [
    { id: 'matin', libelle: CRENEAUX.matin.libelle, plage: CRENEAUX.matin.plage },
    { id: 'apres-midi', libelle: CRENEAUX['apres-midi'].libelle, plage: CRENEAUX['apres-midi'].plage },
    { id: undefined, libelle: 'Sans préférence' },
  ];
  return (
    <div role="radiogroup" aria-label={legende} className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
      {options.map((option) => {
        const actif = valeur === option.id;
        return (
          <button
            key={option.id ?? 'indifferent'}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChange(option.id)}
            className={`rounded-lg border-2 px-2 py-2 text-center text-xs leading-tight transition-colors ${
              actif ? 'border-black bg-black text-white' : 'border-slate-200 text-slate-700 hover:border-black'
            }`}
          >
            <span className="block font-bold">{option.libelle}</span>
            {option.plage && <span className="block opacity-80">{option.plage}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function PeriodeLocationPicker({
  periode,
  onChange,
  manquante = false,
  objet = 'totems',
}: {
  periode: PeriodeLocation;
  onChange: (periode: PeriodeLocation) => void;
  /** Signale que la période doit être complétée avant de continuer. */
  manquante?: boolean;
  /** Ce qui est livré puis enlevé, au pluriel (« totems », « massifs »). */
  objet?: string;
}) {
  const duree = dureeEnJours(periode);
  const selection: DateRange | undefined = periode.debut
    ? { from: periode.debut, to: periode.fin }
    : undefined;

  // Un clic sur une période déjà complète en commence une nouvelle ; sinon le
  // clic fixe la date d'enlèvement (ou ramène le début si la date est antérieure).
  const choisirJour = (jourClique: Date) => {
    const { debut, fin } = periode;
    if (!debut || fin) {
      onChange({ ...periode, debut: jourClique, fin: undefined });
    } else if (isBefore(jourClique, debut)) {
      onChange({ ...periode, debut: jourClique });
    } else {
      onChange({ ...periode, fin: jourClique });
    }
  };

  return (
    <div
      id="periode-location"
      className={`rounded-xl border-2 p-5 mb-8 ${manquante ? 'border-red-600' : 'border-slate-200'}`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold text-black">Période de location</h3>
        <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Obligatoire</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Cliquez sur la date de livraison souhaitée, puis sur la date d&apos;enlèvement.
      </p>

      <div className="flex flex-col gap-5">
        <div className="self-center">
          <Calendar
            mode="range"
            locale={fr}
            numberOfMonths={2}
            showOutsideDays={false}
            selected={selection}
            onDayClick={choisirJour}
            defaultMonth={periode.debut}
            disabled={{ before: startOfToday() }}
            className="rounded-lg border border-slate-200 p-2"
            classNames={{
              head_cell: 'text-muted-foreground w-8 font-normal text-[0.7rem]',
              row: 'flex w-full mt-1',
              month: 'flex flex-col gap-2',
              // La date du jour n'est qu'un repère (point sous le chiffre) : elle
              // ne doit pas ressembler à une date choisie.
              day_today:
                "relative font-bold text-red-700 after:absolute after:bottom-0.5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-red-600 after:content-['']",
            }}
          />
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <span className="inline-block size-1.5 rounded-full bg-red-600" aria-hidden="true" />
            Aujourd&apos;hui
            <span className="ml-3 inline-block size-3 rounded-sm bg-black" aria-hidden="true" />
            Votre période
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2" aria-live="polite">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-700" strokeWidth={2} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Début : livraison</p>
                <p className={`mt-0.5 font-bold ${periode.debut ? 'text-black' : 'text-gray-400'}`}>
                  {jour(periode.debut)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">Date à laquelle vous souhaitez recevoir vos {objet}.</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold text-black">Préférence pour la livraison</p>
            <ChoixCreneau
              legende="Préférence de livraison"
              valeur={periode.creneauLivraison}
              onChange={(creneauLivraison) => onChange({ ...periode, creneauLivraison })}
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <PackageOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-700" strokeWidth={2} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Fin : enlèvement</p>
                <p className={`mt-0.5 font-bold ${periode.fin ? 'text-black' : 'text-gray-400'}`}>
                  {jour(periode.fin)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">Date à laquelle vos {objet} seront enlevés.</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold text-black">Préférence pour l&apos;enlèvement</p>
            <ChoixCreneau
              legende="Préférence d'enlèvement"
              valeur={periode.creneauEnlevement}
              onChange={(creneauEnlevement) => onChange({ ...periode, creneauEnlevement })}
            />
          </div>

        </div>

        <p className="text-sm text-gray-700">
          <span className="font-bold">Durée de la location : </span>
          {duree ? `${duree} jour${duree > 1 ? 's' : ''}` : '—'}
        </p>
      </div>

      {delaiTropCourt(periode) && (
        <div role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Votre livraison est souhaitée dans moins de {DELAI_MINIMAL_JOURS / 7} semaines. Merci de{' '}
            <Link to="/contact" className="font-semibold underline">
              nous contacter
            </Link>{' '}
            pour vérifier la disponibilité.
          </p>
        </div>
      )}

      {manquante && (
        <p role="alert" className="text-sm text-red-700 mt-4">
          Choisissez la date de livraison et la date d&apos;enlèvement pour continuer.
        </p>
      )}
    </div>
  );
}
