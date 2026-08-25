import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import image_Celize_caisson_bois_800_rendu3D_01 from '@/imports/Celize_caisson_bois_800_rendu3D_01.png';
import image_Celize_caisson_bois_1200_rendu3D_01 from '@/imports/Celize_caisson_bois_1200_rendu3D_01.png';
import image_Celize_caisson_bois_1600_rendu3D_01 from '@/imports/Celize_caisson_bois_1600_rendu3D_01.png';
import image_Celize_caisson_bois_2000_rendu3D_01 from '@/imports/Celize_caisson_bois_2000_rendu3D_01.png';

const TOTEM_DATA = {
  '80': {
    label: 'Caisson Bois 80',
    price: 2650,
    dimensions: 'L 88,4 cm x H 210,5 cm x P 90 cm',
    width: '88,4 cm',
    height: '210,5 cm',
    depth: '90 cm',
    weight: '215 kg',
    footprint: '<1 m²',
    panelSize: '80 x 150 cm',
    panelPrice: 120,
    image: image_Celize_caisson_bois_800_rendu3D_01
  },
  '120': {
    label: 'Caisson Bois 120',
    price: 3200,
    dimensions: 'L 128,8 cm x H 210,5 cm x P 90 cm',
    width: '128,8 cm',
    height: '210,5 cm',
    depth: '90 cm',
    weight: '325 kg',
    footprint: '1,16 m²',
    panelSize: '120 x 150 cm',
    panelPrice: 180,
    image: image_Celize_caisson_bois_1200_rendu3D_01
  },
  '160': {
    label: 'Caisson Bois 160',
    price: 3960,
    dimensions: 'L 169,2 cm x H 210,5 cm x P 90 cm',
    width: '169,2 cm',
    height: '210,5 cm',
    depth: '90 cm',
    weight: '432 kg',
    footprint: '1,5 m²',
    panelSize: '160 x 150 cm',
    panelPrice: 240,
    image: image_Celize_caisson_bois_1600_rendu3D_01
  },
  '200': {
    label: 'Caisson Bois 200',
    price: 4730,
    dimensions: 'L 209,8 cm x H 210,5 cm x P 90 cm',
    width: '209,8 cm',
    height: '210,5 cm',
    depth: '90 cm',
    weight: '495 kg',
    footprint: '1,9 m²',
    panelSize: '200 x 150 cm',
    panelPrice: 300,
    image: image_Celize_caisson_bois_2000_rendu3D_01
  }
};

export function TotemComparePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formats = searchParams.get('formats')?.split(',') || [];

  const selectedFormats = formats
    .filter(f => f in TOTEM_DATA)
    .map(f => ({ id: f, data: TOTEM_DATA[f as keyof typeof TOTEM_DATA] }));

  if (selectedFormats.length < 2) {
    return (
      <div className="max-w-6xl mx-auto pt-[var(--header-height)] px-4">
        <Card className="border-2 border-yellow-500">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Comparaison impossible</h2>
            <p className="text-gray-700 mb-6">
              Veuillez sélectionner au moins 2 formats pour effectuer une comparaison.
            </p>
            <Button onClick={() => navigate('/totem/caisson-bois/format')} className="bg-black hover:bg-gray-800 text-white">
              Retour aux formats
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSelectFormat = (formatId: string) => {
    navigate(`/totem/caisson-bois/${formatId}`);
  };

  return (
    <div className="max-w-7xl mx-auto pt-[var(--header-height)] px-4 pb-16">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/totem/caisson-bois/format')}
          className="border border-black"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux formats
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-2 text-black">Comparaison des formats</h1>
      <p className="text-gray-700 mb-8">Comparez les caractéristiques et choisissez le format adapté à vos besoins</p>

      <div className={`grid ${selectedFormats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-6`}>
        {selectedFormats.map(({ id, data }) => (
          <Card key={id} className="border-2 border-gray-200">
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                  src={data.image}
                  alt={data.label}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-black mb-4">{data.label}</h3>

                {/* Prix */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Prix unitaire</p>
                  <p className="text-2xl font-bold text-black">{data.price}€ <span className="text-sm font-normal">HT</span></p>
                  <p className="text-sm text-green-700 mt-1">Dès 5 unités : {Math.round(data.price * 0.9)}€ HT</p>
                </div>

                {/* Caractéristiques */}
                <div className="space-y-3 mb-6">
                  <div className="border-b border-gray-200 pb-2">
                    <p className="text-xs text-gray-600">Largeur</p>
                    <p className="font-semibold text-black">{data.width}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <p className="text-xs text-gray-600">Hauteur</p>
                    <p className="font-semibold text-black">{data.height}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <p className="text-xs text-gray-600">Profondeur</p>
                    <p className="font-semibold text-black">{data.depth}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <p className="text-xs text-gray-600">Poids</p>
                    <p className="font-semibold text-black">{data.weight}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <p className="text-xs text-gray-600">Emprise au sol</p>
                    <p className="font-semibold text-black">{data.footprint}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <p className="text-xs text-gray-600">Format panneau</p>
                    <p className="font-semibold text-black">{data.panelSize}</p>
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-600">Prix panneau imprimé</p>
                    <p className="font-semibold text-black">{data.panelPrice}€ HT</p>
                  </div>
                </div>

                {/* Bouton de sélection */}
                <Button
                  onClick={() => handleSelectFormat(id)}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Choisir ce format
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau récapitulatif */}
      <Card className="mt-8 border-2 border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 text-black">Tableau comparatif</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-black">Caractéristique</th>
                  {selectedFormats.map(({ id, data }) => (
                    <th key={id} className="text-center py-3 px-4 font-semibold text-black">{data.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-700">Prix unitaire (HT)</td>
                  {selectedFormats.map(({ id, data }) => (
                    <td key={id} className="text-center py-3 px-4 font-semibold text-black">{data.price}€</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Prix dès 5 unités (HT)</td>
                  {selectedFormats.map(({ id, data }) => (
                    <td key={id} className="text-center py-3 px-4 font-semibold text-green-700">{Math.round(data.price * 0.9)}€</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-700">Largeur</td>
                  {selectedFormats.map(({ id, data }) => (
                    <td key={id} className="text-center py-3 px-4 text-black">{data.width}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Poids</td>
                  {selectedFormats.map(({ id, data }) => (
                    <td key={id} className="text-center py-3 px-4 text-black">{data.weight}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-700">Emprise au sol</td>
                  {selectedFormats.map(({ id, data }) => (
                    <td key={id} className="text-center py-3 px-4 text-black">{data.footprint}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Format panneau</td>
                  {selectedFormats.map(({ id, data }) => (
                    <td key={id} className="text-center py-3 px-4 text-black">{data.panelSize}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Prix panneau imprimé (HT)</td>
                  {selectedFormats.map(({ id, data }) => (
                    <td key={id} className="text-center py-3 px-4 text-black">{data.panelPrice}€</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
