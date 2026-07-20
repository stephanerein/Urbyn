import { Check } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'Définir votre besoin' },
  { number: 2, label: 'Choisir le service' },
  { number: 3, label: 'Obtenir votre estimation' },
  { number: 4, label: 'Échanger avec un spécialiste' }
];

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="sticky top-[73px] left-0 right-0 bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 z-40 shadow-sm">
      <div className="w-full max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep > step.number
                      ? 'bg-black text-white'
                      : currentStep === step.number
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <p
                  className={`mt-2 text-[10px] md:text-xs font-medium text-center leading-tight ${
                    currentStep >= step.number ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-1 md:mx-2 transition-all ${
                    currentStep > step.number ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
