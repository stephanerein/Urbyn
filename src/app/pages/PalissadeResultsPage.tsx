import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Results, CartData } from '../components/Results';
import type { HoardingConfig, PriceBreakdown } from '../types';
import { MATERIAL_PRICES, FOUNDATION_PRICES, ACCESS_PRICES, BET_PRICE, calculateInstallationCost } from '../lib/pricing';

export function PalissadeResultsPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<HoardingConfig | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  useEffect(() => {
    const storedConfig = sessionStorage.getItem('palissadeConfig');
    if (storedConfig) {
      const parsedConfig: HoardingConfig = JSON.parse(storedConfig);
      setConfig(parsedConfig);
      
      let materialCost = 0;
      let foundationCost = 0;
      let gatesCost = 0;
      let laborCost = 0;
      let betCost = 0;

      if (parsedConfig.projectType === 'habillage') {
        // Calcul pour habillage avec multi-bardages
        if (parsedConfig.materials && parsedConfig.materials.length > 0) {
          parsedConfig.materials.forEach(mat => {
            const surface = mat.surface || 0;
            
            // Prix selon le type de matériau
            if (mat.type === 'dibond') {
              // Prix selon le type de lamination
              const lamination = mat.dibondLamination || 'satin';
              const priceKey = `dibond_${lamination.replace('-', '_')}` as keyof typeof MATERIAL_PRICES;
              materialCost += surface * MATERIAL_PRICES[priceKey];
            } else if (mat.type === 'tole') {
              materialCost += surface * MATERIAL_PRICES.tole;
            } else if (mat.type === 'bois') {
              // Prix selon le traitement
              const pricePerM2 = mat.boisTreatment === 'classe3' 
                ? MATERIAL_PRICES.bois_classe3 
                : MATERIAL_PRICES.bois_classe2;
              materialCost += surface * pricePerM2;
            } else if (mat.type === 'vegetal') {
              // Prix selon le type de végétal
              const pricePerM2 = mat.vegetalType === 'mur'
                ? MATERIAL_PRICES.vegetal_mur
                : MATERIAL_PRICES.vegetal_feuillage;
              materialCost += surface * pricePerM2;
            }
          });
          
          // Calcul de l'installation si demandée
          if (parsedConfig.includeInstaller) {
            const totalSurface = parsedConfig.materials.reduce((sum, mat) => sum + (mat.surface || 0), 0);
            laborCost = calculateInstallationCost(totalSurface);
          }
        }
      } else {
        // Montage
        foundationCost = (parsedConfig.soilEnrobe || 0) * FOUNDATION_PRICES.enrobe + (parsedConfig.soilMeuble || 0) * FOUNDATION_PRICES.meuble;
        
        // Detailed gate calculation
        if (parsedConfig.portailsSelections) {
          parsedConfig.portailsSelections.forEach(p => {
            gatesCost += (ACCESS_PRICES as any)[p.type] || 0;
          });
        }
        if (parsedConfig.portillonsSelections) {
          parsedConfig.portillonsSelections.forEach(p => {
            gatesCost += (ACCESS_PRICES as any)[p.type] || 0;
          });
        }
        
        if (parsedConfig.materials) {
          parsedConfig.materials.forEach(mat => {
            const surface = mat.surface || (mat.length || 0) * parsedConfig.height;
            
            // Prix selon le type de matériau
            if (mat.type === 'dibond') {
              // Prix selon le type de lamination
              const lamination = mat.dibondLamination || 'satin';
              const priceKey = `dibond_${lamination.replace('-', '_')}` as keyof typeof MATERIAL_PRICES;
              materialCost += surface * MATERIAL_PRICES[priceKey];
            } else if (mat.type === 'tole') {
              materialCost += surface * MATERIAL_PRICES.tole;
            } else if (mat.type === 'bois') {
              const pricePerM2 = mat.boisTreatment === 'classe3' 
                ? MATERIAL_PRICES.bois_classe3 
                : MATERIAL_PRICES.bois_classe2;
              materialCost += surface * pricePerM2;
            } else if (mat.type === 'vegetal') {
              const pricePerM2 = mat.vegetalType === 'mur'
                ? MATERIAL_PRICES.vegetal_mur
                : MATERIAL_PRICES.vegetal_feuillage;
              materialCost += surface * pricePerM2;
            }
          });
        }
        
        if (parsedConfig.includeInstaller) {
          const totalLength = (parsedConfig.soilEnrobe || 0) + (parsedConfig.soilMeuble || 0);
          const totalSurface = totalLength * parsedConfig.height;
          laborCost = calculateInstallationCost(totalSurface);
        }
      }
      
      if (parsedConfig.includeBET) {
        betCost = BET_PRICE;
      }
      
      const totalCost = materialCost + foundationCost + gatesCost + laborCost + betCost;

      setPriceBreakdown({
        materialCost,
        foundationCost,
        gatesCost,
        laborCost,
        betCost,
        totalCost
      });
    } else {
      navigate('/palissade');
    }
  }, [navigate]);

  const handleReset = () => {
    sessionStorage.removeItem('palissadeConfig');
    navigate('/');
  };

  const handleAddToCart = (cartData: CartData) => {
    // Stocker les données du panier dans sessionStorage
    sessionStorage.setItem('cartData', JSON.stringify(cartData));
    // Naviguer vers la page panier
    navigate('/panier');
  };

  if (!config || !priceBreakdown) {
    return null;
  }

  return (
    <Results 
      config={config} 
      priceBreakdown={priceBreakdown} 
      onReset={handleReset}
      onAddToCart={handleAddToCart}
    />
  );
}
