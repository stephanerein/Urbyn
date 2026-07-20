import { Card, CardContent } from './ui/card';
import { Paintbrush, HardHat, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface PalissadeSubTypeSelectorProps {
  onSelect: (type: 'habillage' | 'montage') => void;
  onBack: () => void;
}

export function PalissadeSubTypeSelector({ onSelect, onBack }: PalissadeSubTypeSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto pt-24">
      <Button 
        onClick={onBack}
        variant="ghost" 
        className="mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>
      
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-2">Type de palissade</h3>
        <p className="text-slate-600">Sélectionnez le type de prestation souhaitée</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habiller une palissade */}
        <Card 
          onClick={() => onSelect('habillage')}
          className="border-2 border-slate-200 hover:border-black cursor-pointer transition-all hover:shadow-xl group"
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 group-hover:bg-black rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <Paintbrush className="w-8 h-8 text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-slate-900">Habiller une palissade</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Vous avez déjà une structure existante (bois ou métal) et souhaitez uniquement la recouvrir 
              avec un bardage de haute qualité : Dibond imprimé, tôle, bois ou végétal.
            </p>
            <div className="mt-4 inline-flex items-center text-sm font-bold text-slate-900">
              Voir les options d'habillage <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </CardContent>
        </Card>

        {/* Monter + habiller */}
        <Card 
          onClick={() => onSelect('montage')}
          className="border-2 border-slate-200 hover:border-black cursor-pointer transition-all hover:shadow-xl group"
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 group-hover:bg-black rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <HardHat className="w-8 h-8 text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-slate-900">Monter + habiller une palissade</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Installation complète de A à Z : terrassement léger, fondations adaptées au sol, 
              structure métallique modulaire, portails et bardage personnalisé.
            </p>
            <div className="mt-4 inline-flex items-center text-sm font-bold text-slate-900">
              Démarrer mon projet complet <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
