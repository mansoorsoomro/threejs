'use client';

interface StepNavigationProps {
  currentStep: number;
  steps: string[];
}

export default function StepNavigation({ currentStep, steps }: StepNavigationProps) {
  return (
    <div className="w-full">
      {/* Top dark grey strip */}
      <div className="w-full h-1 bg-gray-800"></div>
      
      {/* Main navigation bar */}
      <div className="w-full bg-green-600 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          {/* Logo placeholder - you can replace with actual logo */}
          <div className="flex items-center mr-6">
            <div className="text-black font-bold text-xl">Menards®</div>
          </div>
          
          {/* Steps */}
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            
            return (
              <div key={index} className="flex items-center">
                {isActive ? (
                  <div className="relative">
                    {/* Hexagon shape using skewed rectangle */}
                    <div className="relative">
                      <div className="bg-white px-6 py-2.5 transform -skew-x-12 border-2 border-white shadow-sm">
                        <span className="text-green-700 font-semibold text-base whitespace-nowrap transform skew-x-12 inline-block">
                          {step}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-300 text-base font-normal">
                    {step}
                  </span>
                )}
                {/* Separator after non-active steps */}
                {index < steps.length - 1 && (
                  <span className={`mx-2 text-gray-300 ${isActive ? 'hidden' : ''}`}>
                    |
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom white strip */}
      <div className="w-full h-3 bg-white"></div>
    </div>
  );
}

