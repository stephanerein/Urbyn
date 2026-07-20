import { useNavigate } from 'react-router-dom';
import { MassifCalculator } from '../components/MassifCalculator';
import type { MassifConfig } from '../components/MassifCalculator';
import { ProgressSteps } from '../components/ProgressSteps';

export function MassifCalculatorPage() {
  const navigate = useNavigate();

  const savedConfig = sessionStorage.getItem('massifConfig');
  const initialConfig = savedConfig ? JSON.parse(savedConfig) : undefined;

  const handleCalculate = (config: MassifConfig) => {
    sessionStorage.setItem('massifConfig', JSON.stringify(config));
    navigate('/massif/resultats');
  };

  return (
    <div className="bg-white min-h-screen pt-[73px]">
      <ProgressSteps currentStep={3} />
      <div className="px-6">
        <MassifCalculator
          initialConfig={initialConfig}
          onCalculate={handleCalculate}
        />
      </div>
    </div>
  );
}
