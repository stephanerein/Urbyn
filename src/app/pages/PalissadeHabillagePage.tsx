import { useNavigate } from 'react-router-dom';
import { Calculator } from '../components/Calculator';
import type { HoardingConfig } from '../types';

export function PalissadeHabillagePage() {
  const navigate = useNavigate();

  const handleCalculate = (config: HoardingConfig) => {
    sessionStorage.setItem('palissadeConfig', JSON.stringify(config));
    navigate('/palissade/resultats');
  };

  return (
    <Calculator 
      projectType="habillage" 
      onCalculate={handleCalculate} 
    />
  );
}