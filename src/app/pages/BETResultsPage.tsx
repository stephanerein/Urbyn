import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BETResults } from '../components/BETResults';
import type { BETConfig } from '../components/BETCalculator';

export function BETResultsPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<BETConfig | null>(null);

  useEffect(() => {
    const storedConfig = sessionStorage.getItem('betConfig');
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    } else {
      navigate('/bureau-d-etudes');
    }
  }, [navigate]);

  const handleReset = () => {
    navigate('/bureau-d-etudes');
  };

  if (!config) {
    return null;
  }

  return (
    <BETResults config={config} onReset={handleReset} />
  );
}
