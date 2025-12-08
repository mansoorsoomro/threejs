'use client';

import { useState } from 'react';
import OpeningPlacement from '@/components/OpeningPlacement';
import StepNavigation from '@/components/StepNavigation';
import StoreSelect from '@/components/StoreSelect';
import BuildingSize from '@/components/BuildingSize';
import BuildingInfo from '@/components/BuildingInfo';
import BuildingAccessories from '@/components/BuildingAccessories';
import LeansAndOpenings from '@/components/LeansAndOpenings';
import BuildingSummary from '@/components/BuildingSummary';
import { BuildingDesign, Store } from '@/types/building';

const STEPS = [
  'Store Select',
  'Building Size',
  'Building Info',
  'Accessories',
  'Leans & Openings',
  'Summary',
  'Delivery',
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [design, setDesign] = useState<BuildingDesign>({
    buildingZipCode: '',
    clientName: '',
    clientAddress: '',
    buildingUse: 'residential',
    width: 24,
    length: 30,
    trussSpacing: '6',
    floorFinish: 'dirt-gravel',
    thickenedEdgeSlab: false,
    postConstructionSlab: false,
    sitePreparation: false,
    sidewallPosts: '4x6',
    clearHeight: '12',
    girtType: '2x4',
    gradeBoard: '2x6',
    wallColor: 'white',
    trimColor: 'white',
    roofColor: 'gray',
    endWallOverhang: '0',
    sidewallOverhang: '0',
    openings: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (data: BuildingDesign) => {
    // Preserve existing openings when form updates
    setDesign(prev => ({ ...data, openings: prev.openings || [] }));
  };

  const handleOpeningsChange = (openings: BuildingDesign['openings']) => {
    setDesign(prev => ({ ...prev, openings }));
  };

  const handleZipCodeChange = (zipCode: string) => {
    setDesign(prev => ({ ...prev, buildingZipCode: zipCode }));
  };

  const handleStoreSelect = (store: Store) => {
    setDesign(prev => ({ ...prev, selectedStore: store }));
    // Automatically move to next step when store is selected
    setTimeout(() => {
      setCurrentStep(2);
    }, 500);
  };

  const handleSubmitQuote = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(design),
      });

      if (response.ok) {
        alert('Quote submitted successfully! A PDF will be emailed to sales@coupebuildingco.com');
      } else {
        throw new Error('Failed to submit quote');
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Error submitting quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StoreSelect
            buildingZipCode={design.buildingZipCode}
            selectedStore={design.selectedStore}
            onZipCodeChange={handleZipCodeChange}
            onStoreSelect={handleStoreSelect}
          />
        );
      case 2:
        return (
          <BuildingSize
            zipCode={design.buildingZipCode || ''}
            onNext={() => setCurrentStep(3)}
          />
        );
      case 3:
        return <BuildingInfo design={design} onSubmit={handleFormSubmit} onNext={() => setCurrentStep(4)} />;
      case 4:
        return <BuildingAccessories design={design} onSubmit={handleFormSubmit} onNext={() => setCurrentStep(5)} />;
      case 5:
        return <LeansAndOpenings design={design} onSubmit={handleFormSubmit} onNext={() => setCurrentStep(6)} />;
      case 6:
        return <BuildingSummary design={design} onNext={() => setCurrentStep(7)} />;
      case 7:
        // Placeholder content for Delivery step – can be built out later
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{STEPS[currentStep - 1]}</h2>
              <p className="text-gray-600">
                This step is not configured yet. You can add Delivery content here later.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Step Navigation */}
      <StepNavigation currentStep={currentStep} steps={STEPS} />

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}

