'use client';

import { useState } from 'react';

interface StepNavigationProps {
  currentStep: number;
  steps: string[];
}

export default function StepNavigation({ currentStep, steps }: StepNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full relative z-[100]">
      {/* Top dark grey strip */}
      <div className="w-full h-1 bg-gray-800"></div>

      {/* Main navigation bar */}
      <div className="w-full bg-[#16a34a] py-3 md:py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-[1101px]:justify-start gap-4">

          {/* Logo & Burger (Mobile/Tablet < 1100px) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="min-[1101px]:hidden text-white p-2 hover:bg-green-700 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <div className="flex items-center min-[1101px]:mr-6 max-[500px]:hidden">
              <div className="text-black font-bold text-lg md:text-xl">Menards®</div>
            </div>
          </div>

          {/* Desktop Steps (> 1100px) */}
          <div className="hidden min-[1101px]:flex items-center flex-wrap gap-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;

              return (
                <div key={index} className="flex items-center">
                  {isActive ? (
                    <div className="relative">
                      <div className="bg-white px-6 py-2 transform -skew-x-12 border-2 border-white shadow-sm">
                        <span className="text-green-700 font-bold text-sm whitespace-nowrap transform skew-x-12 inline-block">
                          {step}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-white/80 text-sm font-medium hover:text-white transition-colors">
                      {step}
                    </span>
                  )}
                  {index < steps.length - 1 && (
                    <span className={`mx-2 text-white/30 ${isActive ? 'hidden' : ''}`}>
                      |
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step Label (Mobile < 1100px) */}
          <div className="min-[1101px]:hidden">
            <span style={{ fontSize: '12px' }} className="text-white font-bold text-sm uppercase tracking-wider bg-green-700 px-3 py-1 rounded">
              Step {currentStep}: {steps[currentStep - 1]}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (< 1100px) */}
      <div className={`
        min-[1101px]:hidden absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 transform origin-top
        ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}
      `}>
        <div className="py-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;

            return (
              <div
                key={index}
                className={`px-6 py-4 flex items-center gap-4 border-b border-gray-50 last:border-none ${isActive ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                  }`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                  {stepNumber}
                </span>
                <span className={`text-sm font-bold ${isActive ? 'text-green-700' : 'text-gray-600'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom white strip */}
      <div className="w-full h-2 bg-white shadow-sm"></div>
    </div>
  );
}
