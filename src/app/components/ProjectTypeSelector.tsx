import { Card, CardContent } from './ui/card';
import { Signpost, HardHat, Box, Wind, ArrowRight, FileText, Building2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import palissadeImg from 'figma:asset/bc5db02dc136e0f6f2acb6bdcfd5000cf7768a25.png';
import totemImg from 'figma:asset/e2fcd681d60aa3d6f1a0a1e46302e95888ec11db.png';
import massifImg from 'figma:asset/1e6a3eb50a7bcc897639b57c16806ba7a3ff933c.png';
import echafaudageImg from 'figma:asset/7be7315ce92388a709e6e81e468bd53334a3f1a8.png';

interface ProjectTypeSelectorProps {
  onSelect: (type: 'totem' | 'palissade' | 'massif' | 'bet' | 'cahier-charges' | 'echafaudage') => void;
}

export function ProjectTypeSelector({ onSelect }: ProjectTypeSelectorProps) {
  const projects = [
    {
      id: 'totem',
      title: 'Totem',
      description: 'Signalétique verticale pour expositions',
      icon: Signpost,
      bgColor: 'from-slate-500 to-slate-600',
      borderColor: 'border-slate-300',
      hoverBorder: 'hover:border-slate-500'
    },
    {
      id: 'palissade',
      title: 'Palissade',
      description: 'Habillage et sécurisation de chantier',
      icon: HardHat,
      bgColor: 'from-slate-600 to-slate-700',
      borderColor: 'border-slate-300',
      hoverBorder: 'hover:border-slate-600'
    },
    {
      id: 'echafaudage',
      title: 'Façade et Échafaudage',
      description: 'Habillage par bâche imprimée',
      icon: Building2,
      bgColor: 'from-slate-500 to-slate-600',
      borderColor: 'border-slate-300',
      hoverBorder: 'hover:border-slate-500'
    },
    {
      id: 'massif',
      title: 'Massif béton',
      description: 'Lestage et stabilisation',
      icon: Box,
      bgColor: 'from-slate-500 to-slate-600',
      borderColor: 'border-slate-300',
      hoverBorder: 'hover:border-slate-500'
    },
    {
      id: 'bet',
      title: 'Étude BET',
      description: 'Résistance au vent de vos installations',
      icon: Wind,
      bgColor: 'from-slate-600 to-slate-700',
      borderColor: 'border-slate-300',
      hoverBorder: 'hover:border-slate-600'
    },
    {
      id: 'cahier-charges',
      title: 'Cahier des Charges',
      description: 'Rédaction pour Appel d\'Offre',
      icon: FileText,
      bgColor: 'from-slate-500 to-slate-600',
      borderColor: 'border-slate-300',
      hoverBorder: 'hover:border-slate-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto -mt-12">
      <div className="text-center mb-12">
        
        <p className="text-black font-medium">Sélectionnez le type de solution souhaitée</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {projects.map(project => (
          <Card
            key={project.id}
            onClick={() => onSelect(project.id as any)}
            className="cursor-pointer transition-all hover:shadow-2xl group bg-white overflow-hidden"
          >
            <CardContent className="p-4 text-center">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <project.icon className="w-7 h-7 text-black" strokeWidth={2.5} />
              </div>
              <h4 className="text-base font-bold mb-1 text-black group-hover:underline">{project.title}</h4>
              <p className="text-black text-[10px] mb-4 font-medium leading-tight h-8">
                {project.description}
              </p>
              <div className="relative h-32 overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={
                    project.id === 'bet' 
                      ? "https://images.unsplash.com/photo-1764740109279-c7a8abd78821?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdpbmVlcmluZyUyMGJsdWVwcmludHMlMjBkZXNrfGVufDF8fHx8MTc2OTUxNDYxNXww&ixlib=rb-4.1.0&q=80&w=1080" 
                      : project.id === 'totem' 
                        ? totemImg 
                        : project.id === 'palissade' 
                          ? palissadeImg 
                          : project.id === 'massif' 
                            ? massifImg 
                            : project.id === 'echafaudage'
                              ? echafaudageImg
                              : "https://images.unsplash.com/photo-1760561994147-8b6fd8c7fc5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMGRvY3VtZW50JTIwY29udHJhY3QlMjBzcGVjaWZpY2F0aW9uc3xlbnwxfHx8fDE3Njk3MTE0NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  }
                  alt={`${project.title} publicitaire`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="mt-3 flex items-center justify-center gap-1 text-black font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>En savoir plus</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}