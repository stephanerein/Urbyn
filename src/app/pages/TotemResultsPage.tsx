import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TotemResults } from '../components/TotemResults';
import type { TotemConfig } from '../components/TotemCalculator';

export function TotemResultsPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TotemConfig | null>(null);

  useEffect(() => {
    const storedConfig = sessionStorage.getItem('totemConfig');
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    } else {
      // Si pas de configuration, rediriger vers le calculateur
      navigate('/totem');
    }
  }, [navigate]);

  const handleReset = () => {
    sessionStorage.removeItem('totemConfig');
    navigate('/');
  };

  if (!config) {
    return null;
  }

  return (
    <TotemResults config={config} onReset={handleReset} />
  );
}
