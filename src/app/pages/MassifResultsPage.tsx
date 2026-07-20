import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MassifResults } from '../components/MassifResults';
import type { MassifConfig } from '../components/MassifCalculator';

export function MassifResultsPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<MassifConfig | null>(null);

  useEffect(() => {
    const storedConfig = sessionStorage.getItem('massifConfig');
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    } else {
      navigate('/massif');
    }
  }, [navigate]);

  const handleReset = () => {
    // On garde la config en session pour pouvoir la modifier
    navigate('/massif');
  };

  if (!config) {
    return null;
  }

  return (
    <MassifResults config={config} onReset={handleReset} />
  );
}
