import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { useNavigate } from 'react-router-dom';
import { BETCalculator } from '../components/BETCalculator';
import type { BETConfig } from '../components/BETCalculator';

export function BETCalculatorPage() {
  const navigate = useNavigate();

  const handleCalculate = (config: BETConfig) => {
    sessionStorage.setItem('betConfig', JSON.stringify(config));
    navigate('/bet/resultats');
  };

  return (
    <>
      <SEOMeta
        title="Bureau d'études techniques — Calcul de conformité"
        description="Calculez la conformité de vos structures selon Eurocode EN 1991-1-4. Note de calcul vent, glissement et renversement pour totems et palissades."
        keywords="bureau d'études, note de calcul, Eurocode, conformité vent, BET chantier"
        url="/bet"
        jsonLd={breadcrumbSchema([{ name: 'Accueil', url: '/' }, { name: 'BET', url: '/bet' }])}
      />
      <BETCalculator onCalculate={handleCalculate} />
    </>
  );
}
