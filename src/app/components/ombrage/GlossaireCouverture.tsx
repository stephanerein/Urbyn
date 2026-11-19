import { SectionDepliable } from './SectionDepliable';

// Glossaire des mots qui désignent une couverture de patio : voile, vélum, toldo…
//
// Sert le référencement (SEO et GEO) : les internautes, et les assistants qui les
// renseignent, cherchent la même chose sous des noms différents. Les définitions
// viennent de dictionnaires et de sources de référence (liste en bas de composant) ;
// ne rien ajouter qui ne soit vérifié. Les phrases « Chez Urbanize » relient chaque
// mot aux deux solutions.

export interface TermeGlossaire {
  terme: string;
  /** Langue du terme, si ce n'est pas le français (balise lang). */
  langue?: 'en' | 'es' | 'de';
  /** Autres graphies ou noms équivalents. */
  aussi?: string;
  definition: string;
}

export const GLOSSAIRE_FRANCAIS: TermeGlossaire[] = [
  {
    terme: 'Couverture de patio',
    definition:
      "Terme générique que retient Urbanize pour désigner tout dispositif qui couvre un patio pour l'ombrager : voile, vélum, store ou toile. Il existe en deux solutions : la couverture repliable et la couverture fixe.",
  },
  {
    terme: "Voile d'ombrage",
    aussi: "toile d'ombrage",
    definition:
      "Toile amovible que l'on tend au-dessus d'un espace extérieur pour créer une zone d'ombre, d'après l'Office québécois de la langue française. Ses équivalents anglais sont shade sail et sun shade sail. Chez Urbanize, la couverture fixe relève de ce principe : une toile microperforée tendue au-dessus du patio.",
  },
  {
    terme: 'Vélum',
    aussi: 'velum',
    definition:
      "Grande pièce d'étoffe déployée au-dessus d'un espace découvert pour l'abriter du soleil ou de la pluie, selon le Dictionnaire de l'Académie française. Le mot vient du latin velum, « voile » ; les Romains tendaient un vélarium au-dessus des théâtres et des amphithéâtres. Chez Urbanize, un vélum est un module de toile : la couverture repliable en juxtapose plusieurs, de 3 m de large.",
  },
  {
    terme: 'Voilage',
    definition:
      "Employé dans le langage courant pour désigner un voile d'ombrage. Au sens strict, un voilage est un tissu léger et ajouré, comme un rideau.",
  },
  {
    terme: 'Voile solaire, toile solaire',
    aussi: 'toile anti-soleil',
    definition: "Autres noms que donnent les fabricants et les revendeurs au voile d'ombrage.",
  },
  {
    terme: 'Toile tendue',
    definition:
      "Toile fixée en tension entre des points d'ancrage. C'est le principe de la couverture fixe d'Urbanize : la toile est reliée à un filin installé sur le pourtour du patio.",
  },
  {
    terme: 'Store repliable',
    definition:
      "Store dont la toile se déploie et se replie à la demande. Celui d'Urbanize fonctionne sur câbles, peut être motorisé et connecté au système d'information du bâtiment : c'est la couverture repliable.",
  },
  {
    terme: 'Store banne',
    definition:
      "Store à bras articulés dont la toile se déploie et se rétracte. Ce n'est pas le principe de la couverture repliable d'Urbanize, qui fonctionne sur câbles.",
  },
  {
    terme: 'Ombrière',
    definition:
      "Structure à claire-voie qui donne de l'ombre, sur un parking ou une terrasse par exemple, d'après Futura-Sciences. Le mot désigne aussi les ombrières photovoltaïques. Pour un patio, Urbanize propose une toile d'ombrage, fixe ou repliable.",
  },
  {
    terme: 'Bâche microperforée',
    aussi: 'toile micro-aérée',
    definition:
      "Toile qui laisse passer l'air. Dans le langage courant, une bâche est plutôt une toile pleine et imperméable. La toile d'Urbanize est microperforée, avec 7,5 % d'ouverture, et classée M1.",
  },
  {
    terme: "Ombrage, solution d'ombrage",
    definition:
      "Ensemble des dispositifs qui créent de l'ombre pour réduire la chaleur reçue. « Solution d'ombrage pour patio » est le nom que donne Urbanize à ses couvertures repliables et fixes.",
  },
];

export const GLOSSAIRE_AUTRES_LANGUES: TermeGlossaire[] = [
  {
    terme: 'Shade sail',
    langue: 'en',
    aussi: 'sun shade sail',
    definition: "Anglais : équivalent de voile d'ombrage, toile tendue au-dessus d'un espace extérieur pour créer de l'ombre.",
  },
  {
    terme: 'Toldo',
    langue: 'es',
    aussi: 'toldo vela, toldo de patio',
    definition:
      "Espagnol : couverture de toile tendue pour donner de l'ombre. Le verbe entoldar signifie couvrir de toldos les patios, les rues, etc., d'après la Real Academia Española. Le toldo vela correspond au voile d'ombrage ; le toldo de brazo articulado, au store banne.",
  },
  {
    terme: 'Sonnensegel',
    langue: 'de',
    definition:
      "Allemand : protection solaire textile, tendue à l'horizontale pour ombrager une surface extérieure. Elle est présentée comme une alternative moderne à la Markise, le store banne.",
  },
];

const SOURCES: Array<[string, string]> = [
  ["Office québécois de la langue française : voile d'ombrage", 'https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/26574387/voile-dombrage'],
  ["Dictionnaire de l'Académie française : vélum", 'https://dictionnaire-academie.fr/article/A9V0337-A'],
  ['Futura-Sciences : ombrière', 'https://www.futura-sciences.com/maison/definitions/maison-ombriere-10803/'],
  ['Merriam-Webster : velarium', 'https://www.merriam-webster.com/dictionary/velaria'],
  ['Real Academia Española : entoldar', 'https://dle.rae.es/entoldar'],
  ['Baunetzwissen : Sonnensegel', 'https://www.baunetzwissen.de/sonnenschutz/fachwissen/textilien/sonnensegel-166494'],
];

function Liste({ termes }: { termes: TermeGlossaire[] }) {
  return (
    <dl className="grid md:grid-cols-2 gap-x-10 gap-y-6">
      {termes.map((t) => (
        <div key={t.terme}>
          <dt className="font-bold text-black">
            <span lang={t.langue}>{t.terme}</span>
            {t.aussi && <span className="font-normal text-gray-500"> · <span lang={t.langue}>{t.aussi}</span></span>}
          </dt>
          <dd className="text-sm text-gray-700 leading-relaxed mt-1">{t.definition}</dd>
        </div>
      ))}
    </dl>
  );
}

export function GlossaireCouverture() {
  return (
    <SectionDepliable id="titre-glossaire" titre="Glossaire : les mots de la couverture de patio">
      <p className="text-sm text-gray-700 mb-8 max-w-[75ch]">
        Voile d'ombrage, vélum, voilage, toldo… Un même dispositif porte plusieurs noms selon les métiers et les
        pays. Voici ceux que l'on rencontre le plus, et ce qu'ils recouvrent chez Urbanize.
      </p>

      <h3 className="text-base font-bold text-black mb-4">En français</h3>
      <Liste termes={GLOSSAIRE_FRANCAIS} />

      <h3 className="text-base font-bold text-black mt-10 mb-4">Dans d'autres langues</h3>
      <Liste termes={GLOSSAIRE_AUTRES_LANGUES} />

      <p className="text-xs text-gray-500 mt-8 max-w-[90ch]">
        Sources :{' '}
        {SOURCES.map(([nom, url], i) => (
          <span key={url}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {nom}
            </a>
            {i < SOURCES.length - 1 ? ' · ' : '.'}
          </span>
        ))}
      </p>
    </SectionDepliable>
  );
}
