import { useNavigate } from 'react-router-dom';
import { TotemCalculator } from '../components/TotemCalculator';
import type { TotemConfig } from '../components/TotemCalculator';

export function TotemCalculatorPage() {
  const navigate = useNavigate();

  const handleCalculate = (config: TotemConfig) => {
    // Stocker la configuration dans sessionStorage pour la page de résultats
    sessionStorage.setItem('totemConfig', JSON.stringify(config));
    navigate('/totem/resultats');
  };

  return (
    <TotemCalculator onCalculate={handleCalculate} />
  );
}
