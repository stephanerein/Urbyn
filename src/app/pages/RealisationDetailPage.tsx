import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { RichText, RichParagraphs, stripLinks } from '../components/RichText';
import { RealisationCard } from '../components/RealisationCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { REALISATIONS, getRealisationBySlug } from '../data/realisations';

/**
 * Réduit le chapô à une meta description : on coupe sur le dernier mot entier
 * avant la limite, jamais au milieu d'un mot — c'est ce texte que Google
 * affiche dans ses résultats.
 */
function toMetaDescription(text: string, maxLength = 160): string {
  const plain = stripLinks(text).replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;

  const cut = plain.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.]$/, '')}…`;
}

// Page de détail générique pour une réalisation. Ce composant est le modèle
// réutilisé pour toutes les réalisations — ajouter une entrée dans
// src/app/data/realisations.ts suffit à générer sa page, sans dupliquer de
// fichier.
export function RealisationDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const realisation = slug ? getRealisationBySlug(slug) : undefined;

  if (!realisation) {
    return <Navigate to="/realisations" replace />;
  }

  const [heroImage, ...galleryImages] = realisation.images;
  const sections = realisation.sections ?? [];
  const facts = realisation.facts ?? [];
  const remainingImages = galleryImages.slice(sections.length);
  const others = REALISATIONS.filter(r => r.slug !== realisation.slug).slice(0, 3);

  return (
    <>
      <SEOMeta
        title={realisation.title}
        description={toMetaDescription(realisation.description)}
        url={`/realisations/${realisation.slug}`}
        jsonLd={breadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Réalisations', url: '/realisations' },
          { name: realisation.title, url: `/realisations/${realisation.slug}` },
        ])}
      />
      <div className="pt-[var(--header-height)] pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-8 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/realisations')}
              className="border-2 border-black"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux réalisations
            </Button>
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
            {realisation.category}
          </p>
          <h1 className="text-4xl font-bold mb-8 text-black">{realisation.title}</h1>

          {/* Photo de couverture en ouverture d'article. */}
          {heroImage && (
            <div className="rounded-xl overflow-hidden mb-8">
              <ImageWithFallback
                src={heroImage}
                alt={`${realisation.title} — vue d'ensemble`}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Données clés du projet. */}
          {facts.length > 0 && (
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 mb-10 border-y border-gray-200">
              {facts.map(fact => (
                <div key={fact.label}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                    {fact.label}
                  </dt>
                  <dd className="text-lg font-bold text-black">
                    <RichText text={fact.value} />
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* Chapô */}
          <div className="mb-16 max-w-[65ch] space-y-5">
            <RichParagraphs
              text={realisation.description}
              className="text-xl text-gray-900 leading-9"
            />
          </div>
        </div>

        {/* Corps de l'article en quinconce : texte et photo alternent de côté
            d'une section à l'autre pour rythmer la lecture. Sur mobile, tout
            repasse en colonne unique (photo au-dessus du texte). */}
        <div className="max-w-6xl mx-auto px-4">
          {sections.map((section, i) => {
            const image = galleryImages[i];
            const imageOnLeft = i % 2 === 1;

            if (!image) {
              // Section sans photo : pleine largeur, alignée sur la colonne de texte.
              return (
                <section key={section.title} className="max-w-[65ch] mx-auto mb-20">
                  <h2 className="text-2xl font-bold text-black mb-5">{section.title}</h2>
                  <div className="space-y-5">
                    <RichParagraphs text={section.body} className="text-lg text-gray-900 leading-8" />
                  </div>
                </section>
              );
            }

            return (
              // Le passage en deux colonnes n'intervient qu'à partir de « lg » :
              // en dessous, la colonne de texte deviendrait trop étroite et le
              // texte se hacherait sur 4 ou 5 mots par ligne.
              <section
                key={section.title}
                className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-20"
              >
                <div className={imageOnLeft ? 'lg:order-1' : 'lg:order-2'}>
                  <div className="rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={image}
                      alt={`${realisation.title} — ${section.title}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <div
                  className={`max-w-[65ch] lg:max-w-none ${imageOnLeft ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  <h2 className="text-2xl font-bold text-black mb-5">{section.title}</h2>
                  <div className="space-y-5">
                    <RichParagraphs text={section.body} className="text-lg text-gray-900 leading-8" />
                  </div>
                </div>
              </section>
            );
          })}

          {/* Photos restantes lorsqu'il y en a plus que de sections. */}
          {remainingImages.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              {remainingImages.map((src, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src={src}
                    alt={`${realisation.title} — photo ${sections.length + i + 2}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Appel à l'action */}
          <div className="rounded-xl bg-gray-50 p-8 text-center mb-16">
            <h2 className="text-2xl font-bold text-black mb-3">
              Un projet similaire à réaliser ?
            </h2>
            <p className="text-lg text-black mb-6 max-w-2xl mx-auto">
              Urbanize conçoit, produit et pose vos habillages urbains — de la palissade de
              chantier au covering de façade.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => navigate('/definir-besoin')}
                className="bg-black text-white hover:bg-gray-800"
              >
                Estimez votre projet
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/habillage-urbain')}
                className="border-2 border-black"
              >
                Notre expertise habillage urbain
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
                className="border-2 border-black"
              >
                Nous contacter
              </Button>
            </div>
          </div>

          {/* Maillage interne : les autres réalisations d'Urbanize. */}
          {others.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-black mb-6">
                Découvrez d'autres réalisations d'Urbanize
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {others.map(other => (
                  <RealisationCard key={other.slug} realisation={other} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
